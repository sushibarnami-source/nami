-- NAMI website — one-time data script: packaging items for takeout orders
-- Run this once in Supabase SQL Editor. No schema change needed — the
-- menu_items.category column already accepts any text value.
--
-- These show up in the waiter app's takeout order screen (in a
-- separate "ტარა — Packaging" section, not mixed with the food menu),
-- so a waiter can add container/bag charges to a takeout order. They
-- do NOT appear anywhere on the public site — the public menu only
-- ever renders the known food categories (rolls, nigiri, ...), so a
-- "packaging" row is simply invisible there.
--
-- Safe to re-run: it replaces any existing packaging rows first.

delete from menu_items where category = 'packaging';

insert into menu_items (category, name_en, name_ka, name_ru, price, price_amount, published, sort_order)
values
  ('packaging', 'Sushi box',  'სუშის ბოქსი',  'Коробка для суши',  '1.50 ₾', 1.50, true, 4),
  ('packaging', 'Noodle box', 'ატრიის ბოქსი', 'Коробка для лапши', '1.50 ₾', 1.50, true, 3),
  ('packaging', 'Bag',        'პარკი',        'Пакет',             '1.50 ₾', 1.50, true, 2),
  ('packaging', 'Sauce box',  'სოუსის ბოქსი', 'Коробка для соуса', '0.50 ₾', 0.50, true, 1);
