-- ============ 003: storage ============
-- Run AFTER creating the bucket 'photos' if you prefer Dashboard creation;
-- this migration creates it programmatically.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "public read photos bucket" on storage.objects
  for select using (bucket_id = 'photos');

create policy "admin upload photos bucket" on storage.objects
  for insert with check (bucket_id = 'photos' and public.is_admin());

create policy "admin update photos bucket" on storage.objects
  for update using (bucket_id = 'photos' and public.is_admin());

create policy "admin delete photos bucket" on storage.objects
  for delete using (bucket_id = 'photos' and public.is_admin());
