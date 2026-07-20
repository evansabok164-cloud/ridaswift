// ── SUPABASE CONFIG ──
// Loaded after the Supabase CDN script on both index.html and rs-admin.html.
// SUPABASE_PUBLISHABLE_KEY is safe to expose in client-side code — it's the
// public-facing key (equivalent to the old "anon" key). Never put a
// service_role/secret key in a file like this.

const SUPABASE_URL = 'https://qxivybafuyrscbxqhnqr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kfYr3LCMcCjNLJboeCTSmg_hIqMSECa';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
