import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a fallback/mock client if environment variables are not provided
// This allows the app to run without Supabase configured
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL and/or anon key are missing. Auth features will be disabled.');
    // Return a mock client with minimal functionality using localhost to prevent external requests
    return createClient('http://localhost:54321', 'mock-anon-key-placeholder', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();
