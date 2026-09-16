-- NAMI website — schema v13: WhatsApp notification settings
-- Run this once in Supabase SQL Editor, AFTER schema_v12.sql.
--
-- Stores the WhatsApp phone number + CallMeBot API key used to send
-- "new order" and "low stock" alerts from the admin dashboard. This is
-- a SEPARATE table from site_settings on purpose: site_settings is
-- publicly readable (the public website reads phone/email/hours from
-- it), but the CallMeBot API key must never be exposed to the public
-- anon key — only an admin can read or write this table.

create table if not exists notification_settings (
  id int primary key default 1,
  whatsapp_phone text not null default '',
  whatsapp_apikey text not null default '',
  new_order_alerts boolean not null default true,
  low_stock_alerts boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint notification_settings_singleton check (id = 1)
);

insert into notification_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists notification_settings_set_updated_at on notification_settings;
create trigger notification_settings_set_updated_at
  before update on notification_settings
  for each row execute function set_updated_at();

alter table notification_settings enable row level security;

drop policy if exists "Admins can read notification settings" on notification_settings;
create policy "Admins can read notification settings"
  on notification_settings for select
  using (is_admin());

drop policy if exists "Admins can update notification settings" on notification_settings;
create policy "Admins can update notification settings"
  on notification_settings for update
  using (is_admin())
  with check (is_admin());
