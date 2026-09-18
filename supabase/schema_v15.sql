-- NAMI website — schema v15: pickup vs delivery for takeout orders
-- Run this once in Supabase SQL Editor, AFTER schema_v14.sql.
--
-- Takeout orders were always treated as delivery (customer address +
-- delivery fee, sent out by taxi/courier). Some customers instead come
-- pick the order up themselves — is_pickup marks that case so the
-- waiter app can skip the address/delivery-fee fields and staff can
-- tell the two apart at a glance. Defaults to false so every existing
-- takeout order keeps reading as delivery, unchanged.

alter table orders add column if not exists is_pickup boolean not null default false;
