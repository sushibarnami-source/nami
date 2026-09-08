-- NAMI website — schema v6: inventory yield % (trim/waste-adjusted cost)
-- Run this once in Supabase SQL Editor, AFTER schema_v4.sql (inventory_items).
--
-- Some ingredients lose weight to trim/waste before they're usable
-- (e.g. salmon fillet loses skin/bones). yield_pct is the percentage
-- of the as-purchased quantity that ends up usable, so recipe cost
-- math can use an effective cost per usable unit instead of the raw
-- purchase price. 100 = no loss (the default, matching all existing
-- items).

alter table inventory_items add column if not exists yield_pct numeric not null default 100;

alter table inventory_items drop constraint if exists inventory_items_yield_pct_check;
alter table inventory_items add constraint inventory_items_yield_pct_check
  check (yield_pct > 0 and yield_pct <= 100);
