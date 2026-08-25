# Admin & Photo Gallery — Architecture & Implementation Plan

> Adds a protected `/admin` area (login, video link management, weekly photo album uploads)
> and a public **Albums** gallery to the existing Christian Awareness Embassy website.
>
> Stack: **React 19 + Vite + TypeScript** (existing) · **Supabase** (Postgres + Auth + Storage + RLS)

---

## 1. Current State Summary (what we integrate into)

| Area | Today |
|---|---|
| App | Single-page scroll site — `src/App.tsx` stacks `Hero → About → Sermons → Events → Ministries → Giving → Contact → Footer` |
| Routing | **None** — anchor links only (`#about`, `#contact`) |
| Videos | YouTube/TikTok IDs **hardcoded** in `src/components/Sermons.tsx` (lines 6–29) |
| State | Local `useState` only, no data layer |
| Styling | Per-component plain CSS in `src/styles/*.css` |
| Extras | framer-motion animations, PWA via `vite-plugin-pwa` |

**Integration principles**
1. Homepage stays exactly as-is — new pages are added *around* it via routing.
2. Sermons section keeps its current look; its video data simply comes from the database instead of constants (with hardcoded values kept as fallback if the DB is unreachable).
3. Follow existing conventions: one CSS file per feature in `src/styles/`, functional components, framer-motion reveal animations.

---

## 2. Target Architecture

```
┌────────────────────────── Browser ──────────────────────────┐
│  React SPA (Vite build)                                     │
│                                                            │
│  Public                     Admin (/admin/*)                │
│  ├ /            homepage    ├ /admin/login                 │
│  │  (unchanged)             ├ /admin           (protected)  │
│  ├ /gallery     albums grid │   ├ Albums CRUD + upload      │
│  └ /gallery/:slug album view │   └ Videos manager           │
└──────────────┬─────────────────────────────┬───────────────┘
               │ supabase-js (anon key)      │ supabase-js (session JWT)
┌──────────────▼─────────────────────────────▼───────────────┐
│                        SUPABASE                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ PostgreSQL  │  │    Auth      │  │  Storage (bucket:  │  │
│  │ albums      │  │ email/pwd    │  │  photos)           │  │
│  │ photos      │  │ 1 admin user │  │  {album}/{photo}/  │  │
│  │ site_videos │  │              │  │   original | thumb │  │
│  │ profiles    │  │              │  │                    │  │
│  │ RLS ON      │  │              │  │  admin-write       │  │
│  └─────────────┘  └──────────────┘  │  public-read       │  │
│                                     └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Why this fits:** the site is fully static today; Supabase keeps it that way — no backend server to run. All authorization lives in Row Level Security, so even though the anon key ships with the bundle, non-admins can only ever read *published* data.

### 2.1 New dependencies

```bash
npm i @supabase/supabase-js react-router-dom jszip
```

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | DB, Auth, Storage client |
| `react-router-dom` | `/gallery*` and `/admin*` routes while preserving the one-page home |
| `jszip` | Client-side "Download all photos" (.zip generation) |

### 2.2 Environment variables (`.env.local`, gitignored)

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

---

## 3. Database Design (PostgreSQL)

### 3.1 Schema

```sql
-- ============ MIGRATION 001: schema ============

-- Admin flag, linked to Supabase Auth user
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Photo albums ("Sunday Service — August 23, 2026", ...)
create table public.albums (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,          -- e.g. sunday-service-2026-08-23
  title          text not null,
  event_date     date not null,
  description    text,
  cover_photo_id uuid,                          -- FK added after photos exists
  published      boolean not null default false,
  photo_count    integer not null default 0,    -- maintained by trigger
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Individual photos inside an album
create table public.photos (
  id                uuid primary key default gen_random_uuid(),
  album_id          uuid not null references public.albums(id) on delete cascade,
  storage_path      text not null unique,       -- 'photos/<albumId>/<photoId>/original.jpg'
  thumb_path        text not null,              -- 'photos/<albumId>/<photoId>/thumb.webp'
  original_filename text,
  width             integer,
  height            integer,
  size_bytes        bigint,
  position          integer not null default 0, -- manual reorder
  uploaded_at       timestamptz not null default now(),
  unique (album_id, position)
);

alter table public.albums
  add constraint albums_cover_fk
  foreign key (cover_photo_id) references public.photos(id) on delete set null;

-- Editable YouTube / TikTok links shown in the Sermons section
create table public.site_videos (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('youtube', 'tiktok')),
  video_id   text not null,                     -- raw platform ID, parsed from pasted URL
  slot       text not null,                     -- 'featured' | 'recent' | 'short'
  title      text,
  caption    text,
  speaker    text,
  series     text,
  position   integer not null default 0,        -- order within slot
  updated_at timestamptz not null default now(),
  unique (kind, slot, position)
);

-- keep photo_count accurate automatically
create or replace function public.sync_photo_count() returns trigger
language plpgsql as $$
begin
  update public.albums a
     set photo_count = (select count(*) from public.photos p where p.album_id = a.id)
   where a.id in (coalesce(new.album_id, old.album_id));
  return null;
end $$;

create trigger photos_count_trg
after insert or delete on public.photos
for each row execute function public.sync_photo_count();

-- auto-updated_at for albums & site_videos
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger albums_touch_trg before update on public.albums
for each row execute function public.touch_updated_at();
create trigger videos_touch_trg before update on public.site_videos
for each row execute function public.touch_updated_at();
```

### 3.2 Security model — RLS + helper

```sql
-- ============ MIGRATION 002: policies ============

-- SECURITY DEFINER avoids RLS recursion on profiles
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles    enable row level security;
alter table public.albums      enable row level security;
alter table public.photos      enable row level security;
alter table public.site_videos enable row level security;

-- profiles: user sees own row only; admins are managed in Supabase Dashboard
create policy "own profile" on public.profiles
  for select using (id = auth.uid());

-- albums: world reads published; admin does everything
create policy "public read published albums" on public.albums
  for select using (published or public.is_admin());
create policy "admin write albums" on public.albums
  for all using (public.is_admin()) with check (public.is_admin());

-- photos: visible iff parent album is published (or viewer is admin)
create policy "public read photos of published albums" on public.photos
  for select using (
    exists (select 1 from public.albums a
            where a.id = album_id and (a.published or public.is_admin()))
  );
create policy "admin write photos" on public.photos
  for all using (public.is_admin()) with check (public.is_admin());

-- site_videos: anyone reads (drives public sermons UI); admin edits
create policy "public read videos" on public.site_videos
  for select using (true);
create policy "admin write videos" on public.site_videos
  for all using (public.is_admin()) with check (public.is_admin());
```

### 3.3 Storage bucket

One **public-read, admin-write** bucket: `photos`

```sql
-- ============ MIGRATION 003: storage policies ============
insert into storage.buckets (id, name, public) values ('photos','photos', true);

create policy "public read photos bucket" on storage.objects
  for select using (bucket_id = 'photos');
create policy "admin upload" on storage.objects
  for insert with check (bucket_id = 'photos' and public.is_admin());
create policy "admin update" on storage.objects
  for update using (bucket_id = 'photos' and public.is_admin());
create policy "admin delete" on storage.objects
  for delete using (bucket_id = 'photos' and public.is_admin());
```

Object layout (UUID-based → effectively unguessable):

```
photos/{album_id}/{photo_id}/original.{jpg|png|webp}   ← full quality (download source)
photos/{album_id}/{photo_id}/thumb.webp                ← ≤1200px, ~80% quality (grid/lightbox)
```

> **Why client-side thumbnails?** Supabase image transformations need a paid tier. Generating the thumb in-browser during upload costs nothing and keeps gallery loads fast regardless of camera file size. Originals stay untouched for downloads.

### 3.4 Seeding videos (one-time, Migration 004)

Insert rows mirroring the current hardcoded values in `Sermons.tsx` so behavior is identical on day one:

| kind | slot | position | video_id | notes |
|---|---|---|---|---|
| youtube | featured | 0 | `Yp_Kr9T3d9I` | Walking in His Purpose |
| youtube | recent | 0 | `7c123xyNyGo` | Sunday preaching Highlight |
| tiktok | short | 0..2 | `7659…444`, `7647…765`, `7639…468` | current three shorts |

---

## 4. Frontend Architecture

### 4.1 Routing (new — minimal change to home)

`main.tsx` wraps the app in `<BrowserRouter>`; `App.tsx` becomes route definitions. The current section stack moves verbatim into `pages/HomePage.tsx` — zero visual change.

```
/                  → HomePage        (existing sections, unchanged)
/gallery           → GalleryPage     (published albums grid)
/gallery/:slug     → AlbumPage       (responsive photo grid + lightbox + downloads)
/admin/login       → LoginPage
/admin             → ProtectedRoute → AdminLayout
   ├ (index)       → DashboardPage   (all albums, publish state, counts)
   ├ albums/new    → AlbumEditPage   (create mode)
   ├ albums/:id    → AlbumEditPage   (edit/upload/reorder/cover/delete/publish)
   └ videos        → VideosPage      (YouTube/TikTok links)
```

Scroll-restoration: hash anchors (`/#about`) still work on the homepage; router navigations reset scroll.

### 4.2 File plan (new files in **bold**, modified files marked ✎)

```
src/
├── main.tsx                        ✎ BrowserRouter wrapper
├── App.tsx                         ✎ becomes <Routes>
├── lib/
│   ├── supabaseClient.ts           (singleton client from env vars)
│   ├── database.types.ts           (generated types for albums/photos/videos)
│   ├── videoUtils.ts               (parse pasted YouTube/TikTok URLs → IDs)
│   ├── imageUtils.ts               (canvas resize → WebP thumb, read dimensions)
│   └── download.ts                 (blob-download single photo; JSZip album zip)
├── context/
│   └── AuthContext.tsx             (session state, login/logout, isAdmin)
├── components/
│   ├── Navbar.tsx                  ✎ adds "Albums" link (→ /gallery)
│   ├── Footer.tsx                  ✎ optional "Admin" footer link
│   ├── ProtectedRoute.tsx          (redirect → /admin/login when signed out)
│   ├── gallery/
│   │   ├── AlbumCard.tsx           (cover, title, date, N photos badge)
│   │   ├── PhotoGrid.tsx           (responsive masonry-style grid)
│   │   └── Lightbox.tsx            (full-view, prev/next, keyboard, download btn)
│   └── admin/
│       ├── AdminLayout.tsx         (topbar: logo, tabs Albums|Videos, logout)
│       ├── AlbumForm.tsx           (title, date, description, publish toggle)
│       ├── PhotoUploader.tsx       (multi-select/drag-drop, per-file + overall progress)
│       ├── PhotoList.tsx           (drag-to-reorder, set cover, delete)
│       └── VideoRowForm.tsx        (paste URL → parsed preview → save)
├── pages/
│   ├── HomePage.tsx                (existing App content moved here)
│   ├── GalleryPage.tsx
│   ├── AlbumPage.tsx
│   └── admin/
│       ├── LoginPage.tsx
│       ├── DashboardPage.tsx
│       ├── AlbumEditPage.tsx
│       └── VideosPage.tsx
├── styles/
│   ├── gallery.css                 (matches dark section aesthetic, serif titles)
│   └── admin.css                   (clean, high-contrast, form-first)
└── supabase/
    ├── migrations/001_schema.sql
    ├── migrations/002_policies.sql
    ├── migrations/003_storage.sql
    └── migrations/004_seed_videos.sql
```

### 4.3 Data-access layer (thin functions used by pages)

```ts
// public
fetchPublishedAlbums(): { id, slug, title, event_date, cover_url, thumb_url, photo_count }[]
fetchAlbumBySlug(slug): album + ordered photos[]
fetchSiteVideos(): grouped by slot  // fallback → current hardcoded arrays

// admin (all guarded additionally by RLS)
createAlbum / updateAlbum / deleteAlbum / togglePublish / setCover
addPhotos(albumId, files, onProgress)   // sequential queue, concurrency 2
deletePhoto(photo)                       // storage objects + row
reorderPhotos(albumId, orderedIds)       // batched position updates
saveVideo(slot, kind, url, meta) / deleteVideo(id)
signIn(email, password) / signOut()
```

---

## 5. Key Workflows

### 5.1 Admin login (first-time setup included)

```
Setup (one-time, Supabase Dashboard):
  Authentication → Add user (email + strong password)
  SQL editor → insert into profiles (id, is_admin)
               values ('<auth-user-uuid>', true);

Staff flow:
  /admin → ProtectedRoute checks session
    ├ no session → redirect /admin/login
    └ session    → AdminLayout (tabs: Albums, Videos, Logout)
  LoginPage: email + password → supabase.auth.signInWithPassword
             errors shown plainly ("Wrong email or password")
  Session persists via localStorage; AuthContext exposes { user, isAdmin }
```

### 5.2 Weekly album upload (the core staff task)

```
Dashboard → [+ New Album]
  1. Title: "Sunday Service" · Date: defaults to most recent Sunday
     → slug auto-generated: sunday-service-2026-08-23 (saved as DRAFT/unpublished)
  2. Drag-and-drop or file-picker (multi-select, JPEG/PNG/WebP, ≤25 MB each)
     Uploader queue (concurrency 2, per-file status + overall % bar):
       for each file: read dims → canvas-resize thumb.webp (≤1200px)
         → upload original → upload thumb → insert photos row
       failures retried once; failed files listed with retry button
  3. First photo auto-set as cover; click any photo → "Set as cover"
  4. Optional: drag handles to reorder; ✕ to delete individual photos
  5. Review → toggle [Publish] → album instantly appears at /gallery
     (unpublish anytime — hides immediately, data retained)
Shortcut: "Duplicate previous album" copies settings (not photos) for weekly reuse.
```

Deleting an album cascades: photos rows + storage folder removed (storage cleanup deletes each object before row delete).

### 5.3 Updating video links

```
/admin/videos → lists Featured / Recent / TikTok Shorts groups
  Staff pastes a full URL (youtu.be, watch?v=, tiktok.com/@user/video/123…)
  videoUtils extracts the ID → live preview card (YouTube thumb / TikTok facade)
  Save → upsert site_videos row
Public effect: Sermons.tsx reads site_videos on mount;
  if query fails/empty → falls back to today's hardcoded constants (never blank).
```

`Sermons.tsx` changes are surgical: the module-level constants become a `DEFAULT_VIDEOS` fallback; one `useEffect` + `useState` swaps in DB rows. Embed/facade rendering code is untouched.

### 5.4 Public gallery browsing

```
Navbar → "Albums" → /gallery
  Grid of published albums (newest event_date first), each card shows
  cover thumb · title · formatted date · "N photos"
  Empty state: friendly message until first album is published.

Click album → /gallery/:slug (404-safe redirect if unpublished/missing)
  Responsive grid of thumbs; click → Lightbox:
    large view (original), ‹ › arrows, Esc close, swipe on touch,
    counter "4 / 62", Download button
Downloads:
  • Single photo → fetch(original) → Blob → programmatic <a download>
    (cross-origin download attr alone won't force filenames)
  • Whole album → "Download all (.zip)" → JSZip streams each original
    into the archive with numbered names (01-filename.jpg …) → saves
    <slug>.zip. Progress shown; recommended soft-cap ~150 photos/zip —
    beyond that, offer chunked zips (part 1/2) to avoid mobile memory limits.
```

---

## 6. UX / Visual Design

- **Gallery pages** reuse the site's identity: same dark `section--dark` background treatment, eyebrow label ("Gallery"), serif section title ("Photo Albums"), framer-motion `fadeUp`/`staggerContainer` reveals from `hooks/useScrollAnimation.ts`. Cards get the same hover-lift language as sermon cards.
- **Lightbox**: black backdrop, blurred, focus-trapped, body-scroll locked.
- **Admin**: deliberately plain — white cards, large tap targets, one primary action per screen, inline validation, human-readable confirmations ("Delete this photo? This can't be undone."). No dev jargon anywhere.
- Mobile-first grids: albums 1-col → 2-col ≥640px → 3-col ≥1024px; photos masonry via CSS columns.

---

## 7. Security Checklist

- [ ] RLS enabled on every table; all four storage policies applied (§3.2–3.3)
- [ ] Only **anon** key in frontend — never the service-role key
- [ ] Admin bootstrapped via Dashboard + `profiles.is_admin`; no public signup endpoint (`Auth → disable email signups`)
- [ ] Upload validation client-side (mime whitelist, size cap) *and* enforced by bucket policy
- [ ] Unpublished albums invisible to anon queries even if someone guesses the slug
- [ ] Password: min 12 chars; enable Supabase leak-protection option
- [ ] `profiles` has no public write policy → privilege escalation impossible from client

---

## 8. Deployment Notes

- Host must serve `index.html` for unknown paths (SPA fallback) so `/gallery/*` and `/admin/*` deep-links work:
  - Netlify: `_redirects` → `/* /index.html 200`
  - Vercel: `vercel.json` rewrite; Cloudflare Pages: automatic for SPAs
- **PWA caveat:** `vite-plugin-pwa` precaches assets; verify new routes aren't served stale after deploys (`autoUpdate` handles it, but bump test on staging). Ensure `sw.js` never caches API/storage responses.
- Run migrations via Supabase CLI (`supabase db push`) or SQL editor; keep them in `/supabase/migrations` for reproducibility.

---

## 9. Delivery Phases

| Phase | Scope | Exit criteria |
|---|---|---|
| **1. Foundation** | Supabase project, migrations 001–004, buckets, admin user, env vars, deps installed | Queries work in SQL editor; RLS verified with anon vs admin tokens |
| **2. Routing + shell** | Router, `HomePage` extraction, Navbar "Albums" link, empty gallery pages render | Home visually unchanged; `/gallery` reachable |
| **3. Auth** | `AuthContext`, login page, `ProtectedRoute`, `AdminLayout` | Can log in/out; `/admin` blocked when signed out |
| **4. Albums core** | Dashboard CRUD, uploader with progress, reorder, cover, publish toggle | Weekly-upload workflow §5.2 completes end-to-end |
| **5. Public gallery** | GalleryPage, AlbumPage, PhotoGrid, Lightbox, individual download, ZIP download | Published albums browsable; unpublished hidden; downloads work on mobile |
| **6. Videos manager** | `site_videos` UI + `Sermons.tsx` wired with fallback | Pasting a TikTok/YT URL updates the live sermons section |
| **7. Polish + deploy** | Empty/error states, a11y pass, PWA check, SPA rewrites, seed example albums from §spec | Production deploy verified on phone + desktop |

Estimated effort: Phases 1–3 ≈ half day each; Phase 4–5 ≈ 1–1.5 days each; 6–7 ≈ half day each.

---

## 10. Future Enhancements (out of scope now)

- Server-side ZIP via Supabase Edge Function for very large albums
- Supabase image transformations (paid) to drop client-side thumbnails
- Multiple admin accounts with audit trail (`updated_by` columns)
- Album tags/search; EXIF date extraction at upload
