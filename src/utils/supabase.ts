import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://alhjcauzfaugdvmmhpjs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseAnonKey && supabaseAnonKey.length > 10);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder-anon-key');
