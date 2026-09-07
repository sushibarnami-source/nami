-- NAMI website — schema v2: menu items + editable site text/settings
-- Run this once in Supabase SQL Editor, AFTER schema.sql and seed_content.sql.
-- Then run seed_menu_items.sql and seed_site_content.sql (in this same folder).

-- ---------------------------------------------------------------
-- Menu items
-- ---------------------------------------------------------------
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- rolls | nigiri | maki | futomaki | tempuraRoll | sets | noodles | appetizers | desserts | drinks
  name_en text not null,
  name_ka text not null,
  name_ru text not null,
  desc_en text default '',
  desc_ka text default '',
  desc_ru text default '',
  price text not null,
  tags text[] not null default '{}', -- any of: spicy, veg, new
  photo_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_idx on menu_items (category, published, sort_order desc);

drop trigger if exists menu_items_set_updated_at on menu_items;
create trigger menu_items_set_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

alter table menu_items enable row level security;

drop policy if exists "Public can read published menu items" on menu_items;
create policy "Public can read published menu items"
  on menu_items for select
  using (published = true);

drop policy if exists "Authenticated users can read all menu items" on menu_items;
create policy "Authenticated users can read all menu items"
  on menu_items for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert menu items" on menu_items;
create policy "Authenticated users can insert menu items"
  on menu_items for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update menu items" on menu_items;
create policy "Authenticated users can update menu items"
  on menu_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete menu items" on menu_items;
create policy "Authenticated users can delete menu items"
  on menu_items for delete
  to authenticated
  using (true);

-- Storage bucket for dish photos
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view menu photos" on storage.objects;
create policy "Public can view menu photos"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

drop policy if exists "Authenticated users can upload menu photos" on storage.objects;
create policy "Authenticated users can upload menu photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-photos');

drop policy if exists "Authenticated users can update menu photos" on storage.objects;
create policy "Authenticated users can update menu photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-photos');

drop policy if exists "Authenticated users can delete menu photos" on storage.objects;
create policy "Authenticated users can delete menu photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-photos');

-- ---------------------------------------------------------------
-- Site content: editable text blocks, keyed by the same names the
-- public site's i18n dictionary already uses (hero, about, stats).
-- ---------------------------------------------------------------
create table if not exists site_content (
  key text primary key,
  value_en text not null default '',
  value_ka text not null default '',
  value_ru text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_set_updated_at on site_content;
create trigger site_content_set_updated_at
  before update on site_content
  for each row execute function set_updated_at();

alter table site_content enable row level security;

drop policy if exists "Public can read site content" on site_content;
create policy "Public can read site content"
  on site_content for select
  using (true);

drop policy if exists "Authenticated users can write site content" on site_content;
create policy "Authenticated users can write site content"
  on site_content for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------
-- Site settings: single-row, language-independent values
-- (phone/email/hours don't need translation).
-- ---------------------------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  phone text not null default '',
  email text not null default '',
  weekday_open text not null default '13:30',
  weekday_close text not null default '23:30',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

drop trigger if exists site_settings_set_updated_at on site_settings;
create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

alter table site_settings enable row level security;

drop policy if exists "Public can read site settings" on site_settings;
create policy "Public can read site settings"
  on site_settings for select
  using (true);

drop policy if exists "Authenticated users can update site settings" on site_settings;
create policy "Authenticated users can update site settings"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);
