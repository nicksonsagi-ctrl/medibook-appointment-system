import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const isConfigured = Boolean(url && /^https:\/\/[^/]+/.test(url) && key && !url.includes('your-project') && !key.includes('your-publishable'));
export const supabase = isConfigured ? createClient(url, key) : null;
export function requireSupabase() {
 if (!supabase) throw new Error('Connect your Supabase project using VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. See README for setup.');
 return supabase;
}
