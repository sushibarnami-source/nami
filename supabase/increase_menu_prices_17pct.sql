-- NAMI website — one-time price increase: +17% across the entire menu
-- Run this once in Supabase SQL Editor.
--
-- Reads the real numeric value out of the existing "price" text column
-- (e.g. "19.00 ₾" -> 19.00) so it works correctly regardless of whether
-- price_amount was ever filled in for a given dish, multiplies by 1.17,
-- rounds to 2 decimals, and writes both price_amount and the displayed
-- price text back in the same "19.00 ₾" format.

-- safety net: price_amount may already exist on your live table even
-- though it isn't in any committed schema file — this is a no-op if so.
alter table menu_items add column if not exists price_amount numeric not null default 0;

-- ---------------------------------------------------------------
-- OPTIONAL: preview the change before committing to it — run this
-- first, check the numbers, then run the update below.
-- ---------------------------------------------------------------
select
  name_en,
  price as old_price,
  round((substring(price from '[0-9]+\.[0-9]+')::numeric) * 1.17, 2) || ' ₾' as new_price
from menu_items
order by category, sort_order desc;

-- ---------------------------------------------------------------
-- The actual update
-- ---------------------------------------------------------------
update menu_items
set
  price_amount = round((substring(price from '[0-9]+\.[0-9]+')::numeric) * 1.17, 2),
  price = round((substring(price from '[0-9]+\.[0-9]+')::numeric) * 1.17, 2) || ' ₾'
where price ~ '[0-9]+\.[0-9]+';
