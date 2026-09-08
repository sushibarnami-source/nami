-- NAMI website — schema v5: customer accounts + admin-only write access
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run
-- (run AFTER schema_v4.sql, which added the kitchen inventory tables)
--
-- IMPORTANT: before running, replace 'OWNER_EMAIL_HERE' below (near the
-- bottom, in the "admins" seed) with the email you use to log into
-- /admin — that is what marks your account as an admin. Every existing
-- write policy that used to allow "any logged-in user" is tightened in
-- this file to "logged-in admin only", because we're about to let
-- ordinary customers create their own accounts on the public site.
-- That includes the kitchen inventory tables from schema_v4.sql: those
-- were also "any authenticated user", which would otherwise let a
-- customer who just signed up on the public site read/edit your stock,
-- costs and suppliers directly via the Supabase client.

-- ---------------------------------------------------------------
-- Admins allowlist — which auth users may use /admin.
-- No public policies on this table on purpose: it can only be read
-- through the is_admin() function below (security definer), never
-- queried directly from the browser.
-- ---------------------------------------------------------------
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table admins enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;
grant execute on function is_admin() to authenticated, anon;

-- Mark your existing admin login as an admin (edit the email first!)
insert into admins (user_id)
select id from auth.users where email = 'OWNER_EMAIL_HERE'
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------
-- Tighten every existing "any authenticated user" write policy down
-- to "admin only", now that customers can also be authenticated
-- users (via their own account, not an admin one).
-- ---------------------------------------------------------------
drop policy if exists "Authenticated users can read all posts" on blog_posts;
create policy "Admins can read all posts" on blog_posts for select using (is_admin());
drop policy if exists "Authenticated users can insert posts" on blog_posts;
create policy "Admins can insert posts" on blog_posts for insert with check (is_admin());
drop policy if exists "Authenticated users can update posts" on blog_posts;
create policy "Admins can update posts" on blog_posts for update using (is_admin()) with check (is_admin());
drop policy if exists "Authenticated users can delete posts" on blog_posts;
create policy "Admins can delete posts" on blog_posts for delete using (is_admin());

drop policy if exists "Authenticated users can upload blog photos" on storage.objects;
create policy "Admins can upload blog photos" on storage.objects for insert with check (bucket_id = 'blog-photos' and is_admin());
drop policy if exists "Authenticated users can update blog photos" on storage.objects;
create policy "Admins can update blog photos" on storage.objects for update using (bucket_id = 'blog-photos' and is_admin());
drop policy if exists "Authenticated users can delete blog photos" on storage.objects;
create policy "Admins can delete blog photos" on storage.objects for delete using (bucket_id = 'blog-photos' and is_admin());

drop policy if exists "Authenticated users can read all menu items" on menu_items;
create policy "Admins can read all menu items" on menu_items for select using (is_admin());
drop policy if exists "Authenticated users can insert menu items" on menu_items;
create policy "Admins can insert menu items" on menu_items for insert with check (is_admin());
drop policy if exists "Authenticated users can update menu items" on menu_items;
create policy "Admins can update menu items" on menu_items for update using (is_admin()) with check (is_admin());
drop policy if exists "Authenticated users can delete menu items" on menu_items;
create policy "Admins can delete menu items" on menu_items for delete using (is_admin());

drop policy if exists "Authenticated users can upload menu photos" on storage.objects;
create policy "Admins can upload menu photos" on storage.objects for insert with check (bucket_id = 'menu-photos' and is_admin());
drop policy if exists "Authenticated users can update menu photos" on storage.objects;
create policy "Admins can update menu photos" on storage.objects for update using (bucket_id = 'menu-photos' and is_admin());
drop policy if exists "Authenticated users can delete menu photos" on storage.objects;
create policy "Admins can delete menu photos" on storage.objects for delete using (bucket_id = 'menu-photos' and is_admin());

drop policy if exists "Authenticated users can write site content" on site_content;
create policy "Admins can write site content" on site_content for all using (is_admin()) with check (is_admin());

drop policy if exists "Authenticated users can update site settings" on site_settings;
create policy "Admins can update site settings" on site_settings for update using (is_admin()) with check (is_admin());

drop policy if exists "Authenticated users can read messages" on contact_messages;
create policy "Admins can read messages" on contact_messages for select using (is_admin());
drop policy if exists "Authenticated users can update messages" on contact_messages;
create policy "Admins can update messages" on contact_messages for update using (is_admin()) with check (is_admin());
drop policy if exists "Authenticated users can delete messages" on contact_messages;
create policy "Admins can delete messages" on contact_messages for delete using (is_admin());

drop policy if exists "Authenticated users can read inventory items" on inventory_items;
create policy "Admins can read inventory items" on inventory_items for select using (is_admin());
drop policy if exists "Authenticated users can insert inventory items" on inventory_items;
create policy "Admins can insert inventory items" on inventory_items for insert with check (is_admin());
drop policy if exists "Authenticated users can update inventory items" on inventory_items;
create policy "Admins can update inventory items" on inventory_items for update using (is_admin()) with check (is_admin());
drop policy if exists "Authenticated users can delete inventory items" on inventory_items;
create policy "Admins can delete inventory items" on inventory_items for delete using (is_admin());

drop policy if exists "Authenticated users can read inventory transactions" on inventory_transactions;
create policy "Admins can read inventory transactions" on inventory_transactions for select using (is_admin());
drop policy if exists "Authenticated users can insert inventory transactions" on inventory_transactions;
create policy "Admins can insert inventory transactions" on inventory_transactions for insert with check (is_admin());
drop policy if exists "Authenticated users can delete inventory transactions" on inventory_transactions;
create policy "Admins can delete inventory transactions" on inventory_transactions for delete using (is_admin());

-- Tag a contact message with which customer account (if any) sent it,
-- so the admin can see "this is a returning registered customer".
alter table contact_messages add column if not exists customer_id uuid references auth.users(id) default auth.uid();

-- ---------------------------------------------------------------
-- Customer accounts — public sign-up. Each row is a customer's own
-- saved name/phone/email plus whether they opted into marketing
-- (news & discounts) emails, so the contact/reservation form on the
-- public site can prefill itself for a logged-in customer.
-- ---------------------------------------------------------------
create table if not exists customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  phone text not null default '',
  email text,
  marketing_opt_in boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists customer_profiles_set_updated_at on customer_profiles;
create trigger customer_profiles_set_updated_at
  before update on customer_profiles
  for each row execute function set_updated_at();

alter table customer_profiles enable row level security;

drop policy if exists "Customers can read own profile" on customer_profiles;
create policy "Customers can read own profile"
  on customer_profiles for select
  using (auth.uid() = id);

drop policy if exists "Customers can update own profile" on customer_profiles;
create policy "Customers can update own profile"
  on customer_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can read all customer profiles" on customer_profiles;
create policy "Admins can read all customer profiles"
  on customer_profiles for select
  using (is_admin());

-- Auto-create a customer_profiles row the moment someone signs up,
-- filled from the name/phone/marketing choice passed at sign-up time
-- (auth.users itself can't be written to directly from the browser).
create or replace function handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into customer_profiles (id, name, phone, email, marketing_opt_in)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email,
    coalesce((new.raw_user_meta_data->>'marketing_opt_in')::boolean, true)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_customer();
