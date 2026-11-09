import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

import { storage } from "@/src/utils/storage";

let client: SupabaseClient | null = null;
let activeSession: Session | null = null;

export function isSupabaseConfigured() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key && !url.includes("your-project.supabase.co"));
}

export function hasSupabaseSession() {
  return activeSession !== null;
}

export function getSupabase() {
  if (client) return client;

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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

export async function ensureSupabaseSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured; using local storage fallback.");
    activeSession = null;
    return null;
  }

  try {
    const supabase = getSupabase();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (session) {
      activeSession = session;
      return session;
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      if (error.message.toLowerCase().includes("anonymous")) {
        console.warn("Anonymous Supabase sign-ins are disabled in Supabase Auth settings; falling back to local storage.");
        activeSession = null;
        return null;
      }
      throw error;
    }
    activeSession = data.session ?? null;
    return activeSession;
  } catch (err) {
    console.warn("Supabase session initialization failed; falling back to local storage:", err);
    activeSession = null;
    return null;
  }
}
