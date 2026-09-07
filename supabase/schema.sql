-- NAMI website — admin panel schema
-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

-- ---------------------------------------------------------------
-- Blog posts table
-- ---------------------------------------------------------------
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  icon text default '📝',
  gradient text default 'linear-gradient(135deg,#4f7a5c,#11241c)',
  post_date date not null default current_date,
  tag_en text not null,
  tag_ka text not null,
  tag_ru text not null,
  title_en text not null,
  title_ka text not null,
  title_ru text not null,
  excerpt_en text not null,
  excerpt_ka text not null,
  excerpt_ru text not null,
  -- each content field is a JSON array of HTML/paragraph strings, same
  -- shape as the BLOG_POSTS.content[lang] arrays already used in js/script.js
  content_en jsonb not null default '[]'::jsonb,
  content_ka jsonb not null default '[]'::jsonb,
  content_ru jsonb not null default '[]'::jsonb,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_idx on blog_posts (published, sort_order desc, post_date desc);

-- keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_set_updated_at on blog_posts;
create trigger blog_posts_set_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------
-- Row Level Security: anyone can read published posts,
-- only a logged-in (authenticated) admin can write.
-- ---------------------------------------------------------------
alter table blog_posts enable row level security;

drop policy if exists "Public can read published posts" on blog_posts;
create policy "Public can read published posts"
  on blog_posts for select
  using (published = true);

drop policy if exists "Authenticated users can read all posts" on blog_posts;
create policy "Authenticated users can read all posts"
  on blog_posts for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert posts" on blog_posts;
create policy "Authenticated users can insert posts"
  on blog_posts for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update posts" on blog_posts;
create policy "Authenticated users can update posts"
  on blog_posts for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete posts" on blog_posts;
create policy "Authenticated users can delete posts"
  on blog_posts for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------
-- Storage bucket for blog photos
-- (Storage bucket + policies below; also creatable via the
-- Storage tab in the dashboard, but this does it in one go.)
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('blog-photos', 'blog-photos', true)
on conflict (id) do nothing;

drop policy if exists "Public can view blog photos" on storage.objects;
create policy "Public can view blog photos"
  on storage.objects for select
  using (bucket_id = 'blog-photos');

drop policy if exists "Authenticated users can upload blog photos" on storage.objects;
create policy "Authenticated users can upload blog photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-photos');

drop policy if exists "Authenticated users can update blog photos" on storage.objects;
create policy "Authenticated users can update blog photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-photos');

drop policy if exists "Authenticated users can delete blog photos" on storage.objects;
create policy "Authenticated users can delete blog photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-photos');

-- ---------------------------------------------------------------
-- Seed: bring over the one real post that already exists on the site
-- (safe to run once; skip if you'd rather add it by hand in the dashboard)
-- ---------------------------------------------------------------
insert into blog_posts (
  slug, icon, gradient, post_date, tag_en, tag_ka, tag_ru,
  title_en, title_ka, title_ru, excerpt_en, excerpt_ka, excerpt_ru,
  content_en, content_ka, content_ru, sort_order
) values (
  'how-to-eat-sushi-properly',
  '🥢',
  'linear-gradient(135deg,#4f7a5c,#11241c)',
  '2026-09-07',
  'Guide', 'გზამკვლევი', 'Гид',
  'How to Eat Sushi Properly?', 'როგორ ვჭამოთ სწორად?', 'Как правильно есть суши?',
  'Ever wondered why ginger, wasabi, and soy sauce are served with sushi? Discover their real history — and how to use them the right way.',
  'გაინტერესებთ, რატომ მიირთმევენ ჯანჯაფილს, ვასაბსა და სოიოს სოუსს სუშისთან ერთად? გაეცანით მათ ნამდვილ ისტორიას და სწორად მირთმევის წესებს.',
  'Задумывались, почему имбирь, васаби и соевый соус подают с суши? Узнайте их настоящую историю — и как использовать их правильно.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  100
)
on conflict (slug) do nothing;
