-- NAMI website — schema v14: allow Yield % above 100
-- Run this once in Supabase SQL Editor, AFTER schema_v13.sql.
--
-- yield_pct's check constraint (from schema_v6.sql) capped it at 100,
-- treating yield only as trim/waste loss (e.g. 80% for a fish that
-- loses skin/bones). But rice and noodles absorb water and roughly
-- double or triple in weight when cooked, so their real yield is
-- 200-300% — a value the constraint rejected outright. Widen the cap
-- to match the app's own validation (1-1000).

alter table inventory_items drop constraint if exists inventory_items_yield_pct_check;
alter table inventory_items add constraint inventory_items_yield_pct_check
  check (yield_pct > 0 and yield_pct <= 1000);
