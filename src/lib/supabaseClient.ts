import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU_PROYECTO.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_ANON_KEY';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('TU_PROYECTO') &&
    !SUPABASE_URL.includes('tu-proyecto') &&
    !SUPABASE_ANON_KEY.includes('TU_ANON_KEY') &&
    !SUPABASE_ANON_KEY.includes('tu-anon-key')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
