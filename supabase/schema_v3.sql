-- NAMI website — schema v3: kitchen inventory management
-- Run this once in Supabase SQL Editor, AFTER schema.sql (it reuses
-- the set_updated_at() function defined there).
--
-- Internal admin tool only — nothing here is public. Every table is
-- readable/writable only by authenticated (logged-in admin) users.

-- ---------------------------------------------------------------
-- Inventory items — current stock of each ingredient/supply
-- ---------------------------------------------------------------
create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'other', -- seafood | produce | rice_noodles | sauces_condiments | dairy | dry_goods | beverages | packaging | other
  unit text not null default 'pcs', -- kg | g | l | ml | pcs | box
  quantity numeric not null default 0,
  min_quantity numeric not null default 0,
  cost_per_unit numeric not null default 0,
  supplier text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_category_idx on inventory_items (category, name);

drop trigger if exists inventory_items_set_updated_at on inventory_items;
create trigger inventory_items_set_updated_at
  before update on inventory_items
  for each row execute function set_updated_at();

alter table inventory_items enable row level security;

drop policy if exists "Authenticated users can read inventory items" on inventory_items;
create policy "Authenticated users can read inventory items"
  on inventory_items for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert inventory items" on inventory_items;
create policy "Authenticated users can insert inventory items"
  on inventory_items for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update inventory items" on inventory_items;
create policy "Authenticated users can update inventory items"
  on inventory_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete inventory items" on inventory_items;
create policy "Authenticated users can delete inventory items"
  on inventory_items for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------
-- Inventory transactions — a log of every stock movement, so
-- current quantity is always explainable (restock, usage, waste,
-- manual correction).
-- ---------------------------------------------------------------
create table if not exists inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  type text not null, -- restock | usage | waste | adjustment
  delta numeric not null, -- signed change applied to quantity
  note text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists inventory_transactions_item_idx on inventory_transactions (item_id, created_at desc);

alter table inventory_transactions enable row level security;

drop policy if exists "Authenticated users can read inventory transactions" on inventory_transactions;
create policy "Authenticated users can read inventory transactions"
  on inventory_transactions for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert inventory transactions" on inventory_transactions;
create policy "Authenticated users can insert inventory transactions"
  on inventory_transactions for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can delete inventory transactions" on inventory_transactions;
create policy "Authenticated users can delete inventory transactions"
  on inventory_transactions for delete
  to authenticated
  using (true);
