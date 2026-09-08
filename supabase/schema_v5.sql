-- NAMI website — schema v5: dish recipes (bill of materials) + numeric price
-- Run this once in Supabase SQL Editor, AFTER schema_v2.sql (menu_items)
-- and schema_v4.sql (inventory_items).
--
-- Links each menu item to the inventory it consumes, so we can compute
-- a dish's food cost and margin. Internal admin tool only — nothing
-- here is public.

-- ---------------------------------------------------------------
-- menu_items gets a numeric price alongside the existing display
-- text (e.g. "19.00 ₾"), needed for cost/margin math.
-- ---------------------------------------------------------------
alter table menu_items add column if not exists price_amount numeric not null default 0;

-- ---------------------------------------------------------------
-- Recipe lines: how much of each inventory item one serving of a
-- dish consumes.
-- ---------------------------------------------------------------
create table if not exists recipe_items (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  quantity numeric not null,
  created_at timestamptz not null default now(),
  unique (menu_item_id, inventory_item_id)
);

create index if not exists recipe_items_menu_item_idx on recipe_items (menu_item_id);

alter table recipe_items enable row level security;

drop policy if exists "Authenticated users can read recipe items" on recipe_items;
create policy "Authenticated users can read recipe items"
  on recipe_items for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert recipe items" on recipe_items;
create policy "Authenticated users can insert recipe items"
  on recipe_items for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update recipe items" on recipe_items;
create policy "Authenticated users can update recipe items"
  on recipe_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete recipe items" on recipe_items;
create policy "Authenticated users can delete recipe items"
  on recipe_items for delete
  to authenticated
  using (true);
