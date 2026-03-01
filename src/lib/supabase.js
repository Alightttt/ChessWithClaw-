import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client = null;
let isConfigured = false;

try {
  // Ensure the URL is valid before creating the client
  const urlToUse = supabaseUrl.startsWith('http') ? supabaseUrl : (supabaseUrl ? `https://${supabaseUrl}` : 'https://placeholder.supabase.co');
  
  client = createClient(
    urlToUse,
    supabaseAnonKey || 'placeholder'
  );
  
  if (supabaseUrl && supabaseAnonKey) {
    isConfigured = true;
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Create a dummy client so the app doesn't crash
  client = {
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: new Error('Supabase not configured') }) }) }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) })
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) })
    }),
    removeChannel: () => {}
  };
}

export const hasSupabase = isConfigured;
export const supabase = client;
