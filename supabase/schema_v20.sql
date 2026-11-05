-- NAMI website — schema v20: blog post featured photo
-- Run this once in Supabase SQL Editor, AFTER schema_v19.sql.
--
-- A featured photo per blog post, shown on the blog card and used as
-- the og:image when the post's own link (blog/<slug>.html) is shared,
-- e.g. on Facebook. Separate from the inline photos a post's content
-- can already contain.

alter table blog_posts add column if not exists photo_url text;
