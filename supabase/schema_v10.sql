-- NAMI website — schema v10: takeout orders
-- Run this once in Supabase SQL Editor, AFTER schema_v9.sql.
--
-- Adds a "takeout" order type alongside the existing dine-in (table)
-- orders, taken by staff in admin/waiter.html with no table involved —
-- just a customer name and phone for pickup. Same orders/order_items
-- tables, same statuses, same admin Orders tab; table_number is simply
-- left null for a takeout order.

alter table orders add column if not exists order_type text not null default 'dine_in'; -- dine_in | takeout
alter table orders add column if not exists customer_name text not null default '';
alter table orders add column if not exists customer_phone text not null default '';

alter table orders alter column table_number drop not null;

alter table orders drop constraint if exists orders_table_number_check;
alter table orders add constraint orders_table_number_check
  check (table_number is null or table_number > 0);

alter table orders drop constraint if exists orders_type_consistency_check;
alter table orders add constraint orders_type_consistency_check
  check (
    (order_type = 'dine_in' and table_number is not null)
    or (order_type = 'takeout' and table_number is null)
  );
