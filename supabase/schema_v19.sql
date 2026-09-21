-- NAMI website — schema v19: promo banner amount/discount field
-- Run this once in Supabase SQL Editor, AFTER schema_v18.sql.
--
-- A short, language-agnostic amount/discount shown prominently in the
-- promotions banner (e.g. "-20%"), separate from the per-language
-- promo text.

alter table site_settings add column if not exists promo_amount text;
