/* Supabase connection for the Pitsruli site and admin panel.
   Fill in both values from Supabase: Project Settings -> API.
   The publishable (anon) key is safe to expose: Row Level Security in
   supabase/schema.sql only lets admins write. While these are empty the
   site shows the built-in content from js/content.js. */
window.PITSRULI_CONFIG = {
  supabaseUrl: 'https://yioilltsgmhuvjcsggpt.supabase.co',
  supabaseKey: 'sb_publishable_T3Np7U-ek_HxNhDIgeIjgA_ZDoAJ-Il'
};
