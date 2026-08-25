-- ============ 004: seed videos ============
-- Mirrors the values currently hardcoded in src/components/Sermons.tsx
-- so the site behaves identically on day one.

insert into public.site_videos (kind, slot, video_id, title, caption, speaker, series, position) values
  ('youtube', 'featured', 'Yp_Kr9T3d9I', 'Walking in His Purpose', null, 'Pastor OFOSU SAMPSON', 'Kingdom Living', 0),
  ('youtube', 'recent',   '7c123xyNyGo', 'Sunday preaching Highlight', null, 'Pastor OFOSU SAMPSON', 'Highlights', 0),
  ('tiktok',  'short',    '7659201547884039444', null, 'Special teachings', null, null, 0),
  ('tiktok',  'short',    '7647192917429439765', null, 'Mid-week Word', null, null, 1),
  ('tiktok',  'short',    '7639371730686856468', null, 'word ministration', null, null, 2);
