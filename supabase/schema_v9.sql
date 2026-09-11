-- NAMI website — schema v9: track who placed an order, for the
-- "your order is ready" ping back to the right waiter
-- Run this once in Supabase SQL Editor, AFTER schema_v8.sql.
--
-- Adds orders.created_by: the staff/admin email that placed the order
-- from admin/waiter.html (blank for a customer's own order.html order).
-- The "ready" status itself needs no schema change — status is a plain
-- text column — admin/waiter.html just filters realtime updates on
-- created_by to know which waiter to ping.

alter table orders add column if not exists created_by text not null default '';
