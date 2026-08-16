import { createClient } from '@supabase/supabase-js';

// As chaves podem vir das variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
// ou configuradas diretamente.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://SEU_PROJETO.supabase.co' &&
  !supabaseUrl.includes('SEU_PROJETO')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
