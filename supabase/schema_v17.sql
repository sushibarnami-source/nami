-- NAMI website — schema v17: mark a dish "sold out" for today
-- Run this once in Supabase SQL Editor, AFTER schema_v16.sql.
--
-- "published" is a permanent curatorial flag (is this dish on the
-- menu at all) — it hides a row everywhere the moment it's off.
-- sold_out is a separate, temporary flag: the dish stays on the menu
-- (still published, still browsable) but is marked unavailable right
-- now, e.g. an ingredient ran out mid-shift. Distinct from published
-- so a dish doesn't have to be removed from the menu just because
-- it's out of stock for a few hours.

alter table menu_items add column if not exists sold_out boolean not null default false;
