-- NAMI website — schema v18: promotions banner
-- Run this once in Supabase SQL Editor, AFTER schema_v17.sql.
--
-- A big banner at the top of the public site for sales/promotions,
-- shown only while promo_active is true. Photo is optional; the
-- title/text themselves live in site_content (keys "promo_title" and
-- "promo_text", one row per language, same as every other homepage
-- text field) so no schema change is needed for those.

alter table site_settings add column if not exists promo_active boolean not null default false;
alter table site_settings add column if not exists promo_photo_url text;
