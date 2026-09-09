-- NAMI website — schema v8: dedicated staff (waiter) role
-- Run this once in Supabase SQL Editor, AFTER schema_v7.sql.
--
-- A "staff" account can only open admin/waiter.html — pick a table, place
-- an order, print a kitchen ticket. It gets read access to orders/order_items
-- (needed to show what's already been sent for a table) but nothing else:
-- no blog/menu/inventory/messages/site-settings, and no way to change an
-- order's status or delete anything — that stays admin-only. Admin accounts
-- keep full access to everything, including the waiter app (is_staff() is
-- true for admins too).
--
-- To make someone a waiter:
--   1. Supabase dashboard -> Authentication -> Users -> Add user
--      (set their email + a password, or send an invite)
--   2. Run, with their real email:
--        insert into staff (user_id) select id from auth.users where email = 'WAITER_EMAIL_HERE';

create table if not exists staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table staff enable row level security;
-- No public policies on purpose (same as the admins table) — this table
-- is only ever read through the is_staff() function below.

create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid())
      or exists (select 1 from staff where user_id = auth.uid());
$$;
grant execute on function is_staff() to authenticated, anon;

-- Staff (and admins) can read orders/order_items — the waiter app needs
-- this to show what's already been sent for the table it's on. Updating
-- an order's status or deleting one stays admin-only (unchanged).
drop policy if exists "Admins can read orders" on orders;
drop policy if exists "Staff can read orders" on orders;
create policy "Staff can read orders"
  on orders for select
  using (is_staff());

drop policy if exists "Admins can read order items" on order_items;
drop policy if exists "Staff can read order items" on order_items;
create policy "Staff can read order items"
  on order_items for select
  using (is_staff());
