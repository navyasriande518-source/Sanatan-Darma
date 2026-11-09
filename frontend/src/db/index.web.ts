// Web preview fallback: same API as the native SQLite layer, persisted with
// the shared storage helper (browser localStorage). Content is bundled.
import { storage } from "@/src/utils/storage";
import { USER_TABLES, UserTable } from "./schema";

const cache: Partial<Record<UserTable, Record<string, any>>> = {};

export async function initDb() {
  for (const t of USER_TABLES) {
    const raw = await storage.getItem(`tbl_${t}`, "{}");
    try { cache[t] = JSON.parse(raw ?? "{}"); } catch { cache[t] = {}; }
  }
}

const flush = (t: UserTable) => storage.setItem(`tbl_${t}`, JSON.stringify(cache[t] ?? {}));

export async function all<T = any>(table: UserTable): Promise<T[]> {
  return Object.values(cache[table] ?? {}) as T[];
}

export async function put(table: UserTable, row: { id: string; [k: string]: any }) {
  cache[table] = { ...(cache[table] ?? {}), [row.id]: row };
  await flush(table);
}

export async function del(table: UserTable, id: string) {
  const c = { ...(cache[table] ?? {}) };
  delete c[id];
  cache[table] = c;
  await flush(table);
}
