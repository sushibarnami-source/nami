-- Pitsruli website — content table and admin access.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
--
-- BEFORE RUNNING: replace OWNER_EMAIL_HERE at the bottom with the email
-- of the Supabase user who will log into /admin. Create that user first
-- in Supabase: Authentication -> Users -> Add user (email + password).
--
-- Safe to run in a project that already has other tables (for example
-- NAMI's): every object here is prefixed with "pitsruli_".

-- All site content (texts in 3 languages, contacts, models) as one JSON row.
create table if not exists pitsruli_site (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function pitsruli_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists pitsruli_site_touch on pitsruli_site;
create trigger pitsruli_site_touch before update on pitsruli_site
  for each row execute function pitsruli_touch();

-- Who may edit. No policies on purpose: read only through pitsruli_is_admin().
create table if not exists pitsruli_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table pitsruli_admins enable row level security;

create or replace function pitsruli_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from pitsruli_admins where user_id = auth.uid());
$$;
grant execute on function pitsruli_is_admin() to authenticated, anon;

-- Everyone can read the site content; only admins can change it.
-- Explicit grants, so this works with "Automatically expose new tables" turned off.
grant select on pitsruli_site to anon, authenticated;
grant insert, update on pitsruli_site to authenticated;
alter table pitsruli_site enable row level security;

drop policy if exists "Public can read pitsruli site" on pitsruli_site;
create policy "Public can read pitsruli site" on pitsruli_site
  for select using (true);

drop policy if exists "Admins can insert pitsruli site" on pitsruli_site;
create policy "Admins can insert pitsruli site" on pitsruli_site
  for insert with check (pitsruli_is_admin());

drop policy if exists "Admins can update pitsruli site" on pitsruli_site;
create policy "Admins can update pitsruli site" on pitsruli_site
  for update using (pitsruli_is_admin()) with check (pitsruli_is_admin());

-- Mark your admin login (edit the email first!)
insert into pitsruli_admins (user_id)
select id from auth.users where email = 'OWNER_EMAIL_HERE'
on conflict (user_id) do nothing;
