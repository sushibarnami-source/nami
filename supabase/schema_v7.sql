-- NAMI website — schema v7: table ordering (QR-per-table orders + kitchen/counter printing)
-- Run this once in Supabase SQL Editor, AFTER schema_v5.sql (it reuses
-- set_updated_at() from schema.sql, is_admin() from schema_v5.sql, and
-- the "Public can read site settings" policy from schema_v2.sql).
--
-- Adds:
--   - site_settings.table_count — how many tables the floor has, set by
--     the admin; the public order page only accepts a table number in
--     this range.
--   - orders / order_items — a customer's order for one table, placed
--     with no login required. Anyone can create an order; only an admin
--     can read, update (change status) or delete one — otherwise the
--     public anon key would let any site visitor read every order.
--   - both tables are added to the supabase_realtime publication so the
--     admin dashboard can show new orders the instant they come in.

alter table site_settings add column if not exists table_count int not null default 12;

alter table site_settings drop constraint if exists site_settings_table_count_check;
alter table site_settings add constraint site_settings_table_count_check
  check (table_count > 0 and table_count <= 200);

-- ---------------------------------------------------------------
-- Orders — one row per order placed from a table
-- ---------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  table_number int not null check (table_number > 0),
  status text not null default 'new', -- new | preparing | served | paid | cancelled
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status, created_at desc);

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

alter table orders enable row level security;

drop policy if exists "Anyone can place an order" on orders;
create policy "Anyone can place an order"
  on orders for insert
  with check (true);

drop policy if exists "Admins can read orders" on orders;
create policy "Admins can read orders"
  on orders for select
  using (is_admin());

drop policy if exists "Admins can update orders" on orders;
create policy "Admins can update orders"
  on orders for update
  using (is_admin())
  with check (is_admin());

drop policy if exists "Admins can delete orders" on orders;
create policy "Admins can delete orders"
  on orders for delete
  using (is_admin());

-- ---------------------------------------------------------------
-- Order items — the dishes on one order, name/price snapshotted at
-- order time (so a later menu edit never changes a past order/receipt)
-- ---------------------------------------------------------------
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id) on delete set null,
  name_en text not null,
  name_ka text not null,
  name_ru text not null,
  price text not null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_idx on order_items (order_id);

alter table order_items enable row level security;

drop policy if exists "Anyone can add items to an order" on order_items;
create policy "Anyone can add items to an order"
  on order_items for insert
  with check (true);

drop policy if exists "Admins can read order items" on order_items;
create policy "Admins can read order items"
  on order_items for select
  using (is_admin());

drop policy if exists "Admins can delete order items" on order_items;
create policy "Admins can delete order items"
  on order_items for delete
  using (is_admin());

-- ---------------------------------------------------------------
-- Realtime: push new orders / item rows to the admin dashboard live
-- ---------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table orders;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'order_items'
  ) then
    alter publication supabase_realtime add table order_items;
  end if;
end $$;
