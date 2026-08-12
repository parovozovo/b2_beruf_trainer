import { createClient } from '@supabase/supabase-js';

const SUPABASE_KEY_STORAGE = 'b2_supabase_anon_key';

// Read key from import.meta.env or localStorage
const envUrl = import.meta.env.VITE_SUPABASE_URL || 'https://alhjcauzfaugdvmmhpjs.supabase.co';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem(SUPABASE_KEY_STORAGE) || '';

// Check if key is a valid non-placeholder string
export const isSupabaseConfigured = Boolean(
  envKey && envKey.length > 20 && !envKey.includes('placeholder')
);

export const supabaseUrl = envUrl;
export const supabaseAnonKey = envKey;

export const supabase = createClient(
  supabaseUrl,
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

export function setCustomSupabaseAnonKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(SUPABASE_KEY_STORAGE, key.trim());
    window.location.reload();
  }
}
