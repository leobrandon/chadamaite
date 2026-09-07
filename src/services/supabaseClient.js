import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://zdlkbyttbyzextamkhwv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_4RpS_kf4WL2FBo9rjfuCMw_hKNPQCDT';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
// Strip trailing /rest/v1 or /rest/v1/ if user pasted REST endpoint directly
const cleanUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '') : '';
const SUPABASE_URL = cleanUrl || DEFAULT_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  !SUPABASE_URL.includes('SEU_PROJETO')
);

export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
      },
    })
  : null;

