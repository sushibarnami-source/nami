-- NAMI website — contact form messages
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

-- ---------------------------------------------------------------
-- Contact messages table
-- Stores every submission of the public "Send a Message" contact
-- form (name, email, phone, message). Phone is required on the
-- public form so this doubles as a customer contact list.
-- ---------------------------------------------------------------
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on contact_messages (created_at desc);

-- ---------------------------------------------------------------
-- Row Level Security: anyone (site visitors, not logged in) can
-- submit a message; only a logged-in admin can read/update/delete.
-- ---------------------------------------------------------------
alter table contact_messages enable row level security;

drop policy if exists "Anyone can submit a message" on contact_messages;
create policy "Anyone can submit a message"
  on contact_messages for insert
  with check (true);

drop policy if exists "Authenticated users can read messages" on contact_messages;
create policy "Authenticated users can read messages"
  on contact_messages for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update messages" on contact_messages;
create policy "Authenticated users can update messages"
  on contact_messages for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete messages" on contact_messages;
create policy "Authenticated users can delete messages"
  on contact_messages for delete
  to authenticated
  using (true);
