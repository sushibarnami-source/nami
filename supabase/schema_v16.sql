-- NAMI website — schema v16: timestamp each order status stage
-- Run this once in Supabase SQL Editor, AFTER schema_v15.sql.
--
-- orders.created_at already marks when an order was received ("new").
-- These columns record when it moved into each later stage, so staff
-- can see how long an order actually took at each step (e.g. "sent to
-- kitchen 14:32, ready 14:50, paid 15:10") instead of only the current
-- status. Set once, the first time an order reaches that stage; a
-- later re-visit of the same status (e.g. bounced back to preparing)
-- just overwrites it with the latest time.

alter table orders add column if not exists preparing_at timestamptz;
alter table orders add column if not exists ready_at timestamptz;
alter table orders add column if not exists served_at timestamptz;
alter table orders add column if not exists paid_at timestamptz;
alter table orders add column if not exists cancelled_at timestamptz;
