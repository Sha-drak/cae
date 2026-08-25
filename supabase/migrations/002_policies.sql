-- ============ 002: row level security ============

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

alter table public.profiles    enable row level security;
alter table public.albums      enable row level security;
alter table public.photos      enable row level security;
alter table public.site_videos enable row level security;

create policy "profiles read own" on public.profiles
  for select using (id = auth.uid());

create policy "public read published albums" on public.albums
  for select using (published or public.is_admin());

create policy "admin manage albums" on public.albums
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read photos of published albums" on public.photos
  for select using (
    exists (
      select 1 from public.albums a
      where a.id = album_id and (a.published or public.is_admin())
    )
  );

create policy "admin manage photos" on public.photos
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read site_videos" on public.site_videos
  for select using (true);

create policy "admin manage site_videos" on public.site_videos
  for all using (public.is_admin()) with check (public.is_admin());
