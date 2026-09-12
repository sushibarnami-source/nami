-- NAMI website — set exact prices for 25 dishes (owner-provided list,
-- rounded to friendly numbers rather than a strict +17%).
-- Run this once in Supabase SQL Editor.
--
-- Matches by name_en (unique per dish), so this is safe to run even if
-- some of these rows currently show "0.00 ₾".

update menu_items m
set price_amount = v.new_price,
    price = v.new_price::text || ' ₾'
from (values
  ('Chicken Noodles', 22.00),
  ('Fried Shrimp Noodles', 24.50),
  ('Mushroom Noodles', 17.50),
  ('Chuka Salad', 11.50),
  ('Fried Shrimp', 17.50),
  ('Tempura Canada Roll', 30.50),
  ('Tempura Bonito Roll', 33.00),
  ('Salmon Nigiri', 6.00),
  ('Eel Nigiri', 7.00),
  ('Tuna Nigiri', 6.00),
  ('Cucumber Maki', 7.00),
  ('Avocado Maki', 8.00),
  ('Salmon Maki', 14.00),
  ('Tuna Maki', 15.00),
  ('Chuka Maki', 9.50),
  ('Golden Dragon', 35.00),
  ('Philadelphia', 31.50),
  ('Tuna Roll', 30.50),
  ('California', 30.50),
  ('Futomaki Eel', 28.00),
  ('Futomaki Salmon', 24.50),
  ('Veggie Roll', 20.00),
  ('NAMI Set — 40 pieces', 70.00),
  ('California Set — 28 pieces', 47.00),
  ('Philadelphia Set — 28 pieces', 56.00)
) as v(name_en, new_price)
where m.name_en = v.name_en;

-- Verify: should return exactly 25 rows, all with the new prices above.
select name_en, price
from menu_items
where name_en in (
  'Chicken Noodles','Fried Shrimp Noodles','Mushroom Noodles','Chuka Salad',
  'Fried Shrimp','Tempura Canada Roll','Tempura Bonito Roll','Salmon Nigiri',
  'Eel Nigiri','Tuna Nigiri','Cucumber Maki','Avocado Maki','Salmon Maki',
  'Tuna Maki','Chuka Maki','Golden Dragon','Philadelphia','Tuna Roll',
  'California','Futomaki Eel','Futomaki Salmon','Veggie Roll',
  'NAMI Set — 40 pieces','California Set — 28 pieces','Philadelphia Set — 28 pieces'
)
order by name_en;
