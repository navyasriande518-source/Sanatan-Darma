// Web and native builds share the Supabase user-data store when configured, falling back to local storage.
import { ensureSupabaseSession, getSupabase, hasSupabaseSession } from "@/src/lib/supabase";
import { storage } from "@/src/utils/storage";
import { USER_TABLES, UserTable } from "./schema";

const cache: Partial<Record<UserTable, Record<string, any>>> = {};

export async function initDb() {
  for (const t of USER_TABLES) {
    const raw = await storage.getItem(`tbl_${t}`, "{}");
    try { cache[t] = JSON.parse(raw ?? "{}"); } catch { cache[t] = {}; }
  }
  await ensureSupabaseSession();
}

const flush = (t: UserTable) => storage.setItem(`tbl_${t}`, JSON.stringify(cache[t] ?? {}));

export async function all<T = any>(table: UserTable): Promise<T[]> {
  if (hasSupabaseSession()) {
    const { data, error } = await getSupabase().from("user_data").select("data").eq("table_name", table).order("updated_at", { ascending: true });
    if (!error && data) {
      return data.map((row) => row.data as T);
    }
  }
  return Object.values(cache[table] ?? {}) as T[];
}

export async function put(table: UserTable, row: { id: string; [k: string]: any }) {
  cache[table] = { ...(cache[table] ?? {}), [row.id]: row };
  await flush(table);

  if (hasSupabaseSession()) {
    const { data: { user } } = await getSupabase().auth.getUser();
    if (user) {
      await getSupabase().from("user_data").upsert({ owner_id: user.id, table_name: table, row_id: row.id, data: row, updated_at: new Date().toISOString() });
    }
  }
}

export async function del(table: UserTable, id: string) {
  const c = { ...(cache[table] ?? {}) };
  delete c[id];
  cache[table] = c;
  await flush(table);

  if (hasSupabaseSession()) {
    await getSupabase().from("user_data").delete().eq("table_name", table).eq("row_id", id);
  }
}
