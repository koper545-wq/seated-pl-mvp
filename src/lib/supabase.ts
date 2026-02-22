import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized to avoid build errors when env vars are not yet set
let _supabase: SupabaseClient | null = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

// Client-side Supabase client (for uploads from browser)
export function getSupabase() {
  if (!_supabase) {
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();
    if (!url || !key) {
      throw new Error("Supabase nie jest skonfigurowany. Ustaw NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Server-side Supabase client (for admin operations)
export function createServerSupabase() {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = getSupabaseAnonKey();

  const key = serviceRoleKey || anonKey;
  if (!url || !key) {
    throw new Error("Supabase nie jest skonfigurowany. Ustaw zmienne środowiskowe.");
  }
  return createClient(url, key);
}

export const STORAGE_BUCKET = "images";
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
