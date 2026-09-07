/* =========================================================
   Supabase project connection
   Safe to expose publicly: the publishable/anon key only ever
   grants what Row Level Security allows (see supabase/schema.sql) —
   public read of published posts, writes require a logged-in admin.
   ========================================================= */
const SUPABASE_URL = 'https://gwwuhxuljpnnqnlivfvp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GWp3XsMpjSfiVqFgkQ7qhA_1Az2r4kl';

const supabaseClient = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
