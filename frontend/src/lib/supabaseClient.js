import { createClient } from "@supabase/supabase-js";

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env) ? process.env : {};

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://qbdcvnkomdzqfxevlhhj.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'dummy_anon_key';

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);
