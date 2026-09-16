-- NAMI website — schema v12: staff can update order status
-- Run this once in Supabase SQL Editor, AFTER schema_v11.sql.
--
-- The waiter app now has its own Orders/Sales tabs (admin/waiter.html)
-- so a waiter can set an order's status themselves and "close" it by
-- picking Paid, instead of only an admin being able to. Deleting an
-- order stays admin-only (unchanged).

drop policy if exists "Admins can update orders" on orders;
drop policy if exists "Staff can update orders" on orders;
create policy "Staff can update orders"
  on orders for update
  using (is_staff())
  with check (is_staff());
