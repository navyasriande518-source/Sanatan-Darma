// Web and native builds share the Supabase user-data store. Content is bundled.
import { ensureSupabaseSession, getSupabase } from "@/src/lib/supabase";
import { UserTable } from "./schema";

export async function initDb() {
  await ensureSupabaseSession();
}

export async function all<T = any>(table: UserTable): Promise<T[]> {
  const { data, error } = await getSupabase().from("user_data").select("data").eq("table_name", table).order("updated_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => row.data as T);
}

export async function put(table: UserTable, row: { id: string; [k: string]: any }) {
  const { data: { user }, error: userError } = await getSupabase().auth.getUser();
  if (userError || !user) throw userError ?? new Error("Supabase session user is unavailable");
  const { error } = await getSupabase().from("user_data").upsert({ owner_id: user.id, table_name: table, row_id: row.id, data: row, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function del(table: UserTable, id: string) {
  const { error } = await getSupabase().from("user_data").delete().eq("table_name", table).eq("row_id", id);
  if (error) throw error;
}
