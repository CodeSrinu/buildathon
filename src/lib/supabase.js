import { createClient } from '@supabase/supabase-js';

let supabase = null;

// Create Supabase client only when needed
function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials are missing. Database functionality will be limited.');
      // Return a mock client or handle gracefully - in a real scenario you might want to throw an error
      // but for build purposes, we'll return null and handle in individual functions
      return null;
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabase;
}

export { getSupabaseClient };