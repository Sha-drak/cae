-- ============ 001: schema ============

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table public.albums (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  event_date     date not null,
  description    text,
  cover_photo_id uuid,
  published      boolean not null default false,
  photo_count    integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.photos (
  id                uuid primary key default gen_random_uuid(),
  album_id          uuid not null references public.albums(id) on delete cascade,
  storage_path      text not null unique,
  thumb_path        text not null,
  original_filename text,
  width             integer,
  height            integer,
  size_bytes        bigint,
  position          integer not null default 0,
  uploaded_at       timestamptz not null default now(),
  unique (album_id, position)
);

create table public.site_videos (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('youtube', 'tiktok')),
  video_id   text not null,
  slot       text not null check (slot in ('featured', 'recent', 'short')),
  title      text,
  caption    text,
  speaker    text,
  series     text,
  position   integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (kind, slot, position)
);

alter table public.albums
  add constraint albums_cover_fk
  foreign key (cover_photo_id) references public.photos(id)
  on delete set null;

create index photos_album_idx on public.photos (album_id, position);
create index albums_published_idx on public.albums (published, event_date desc);
create index site_videos_slot_idx on public.site_videos (kind, slot, position);

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

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger albums_touch_trg before update on public.albums
for each row execute function public.touch_updated_at();

create trigger videos_touch_trg before update on public.site_videos
for each row execute function public.touch_updated_at();
