import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { storage } from "@/src/utils/storage";

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY");
  }

  client = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: {
        getItem: async (key) => storage.getItem(key, null),
        removeItem: async (key) => { await storage.removeItem(key); },
        setItem: async (key, value) => { await storage.setItem(key, value); },
      },
    },
  });
  return client;
}

export async function ensureSupabaseSession() {
  const supabase = getSupabase();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    if (error.message.toLowerCase().includes("anonymous")) {
      throw new Error("Anonymous Supabase sign-ins are disabled. Enable Anonymous Users in Supabase Auth settings.");
    }
    throw error;
  }
  if (!data.session) throw new Error("Supabase anonymous sign-in did not return a session");
  return data.session;
}