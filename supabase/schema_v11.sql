-- NAMI website — schema v11: delivery address + delivery fee for takeout orders
-- Run this once in Supabase SQL Editor, AFTER schema_v10.sql.
--
-- Takeout orders are currently sent out by taxi/courier; the delivery
-- fee is entered by hand (there's no automated courier pricing yet).
-- Both fields are blank/zero and unused for dine-in orders.

alter table orders add column if not exists customer_address text not null default '';
alter table orders add column if not exists delivery_fee numeric not null default 0;
