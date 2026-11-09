// User data is stored in Supabase when available and mirrored locally in SQLite for offline reading.
import * as SQLite from "expo-sqlite";

import { AUDIO_TRACKS, BOOKS, CATEGORIES } from "@/src/data/content";
import { ensureSupabaseSession, getSupabase, hasSupabaseSession } from "@/src/lib/supabase";
import { CONTENT_SQL, USER_TABLES, UserTable } from "./schema";

const SEED_VERSION = "1";
let db: SQLite.SQLiteDatabase | null = null;

export async function initDb() {
  db = await SQLite.openDatabaseAsync("sanatana.db");
  await db.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  await db.execAsync(CONTENT_SQL);
  for (const t of USER_TABLES) {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS ${t} (id TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL, updated_at TEXT NOT NULL);`);
  }
  await db.execAsync("CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);");
  const row = await db.getFirstAsync<{ value: string }>("SELECT value FROM meta WHERE key = 'seed_version'");
  if (row?.value !== SEED_VERSION) await seed();
  await ensureSupabaseSession();
}

async function seed() {
  const d = db!;
  await d.withTransactionAsync(async () => {
    for (const c of CATEGORIES) await d.runAsync("INSERT OR IGNORE INTO book_categories VALUES (?,?,?,?)", c.id, c.name.en, c.name.te ?? null, c.icon);
    for (const b of BOOKS) {
      await d.runAsync("INSERT OR IGNORE INTO books VALUES (?,?,?,?,?,?,?,?)", b.id, b.categoryId, b.title.en, b.title.te ?? null, b.attribution.en, b.description.en, b.edition, b.source);
      for (const l of b.languages) await d.runAsync("INSERT OR IGNORE INTO book_languages VALUES (?,?)", b.id, l);
      for (const c of b.chapters) {
        await d.runAsync("INSERT OR IGNORE INTO chapters VALUES (?,?,?,?,?,?)", c.id, b.id, c.number, c.title.en, c.title.te ?? null, c.verseCount ?? null);
        for (const v of c.verses) {
          await d.runAsync("INSERT OR IGNORE INTO verses VALUES (?,?,?,?,?,?)", v.id, c.id, b.id, v.n, v.ref, v.sa);
          await d.runAsync("INSERT OR IGNORE INTO translations VALUES (?,?,?)", v.id, "en", v.en);
          if (v.te) await d.runAsync("INSERT OR IGNORE INTO translations VALUES (?,?,?)", v.id, "te", v.te);
          if (v.iast) await d.runAsync("INSERT OR IGNORE INTO transliterations VALUES (?,?,?)", v.id, "iast", v.iast);
          if (v.noteEn) await d.runAsync("INSERT OR IGNORE INTO commentaries VALUES (?,?,?)", v.id, "en", v.noteEn);
        }
      }
    }
    for (const t of AUDIO_TRACKS) {
      await d.runAsync("INSERT OR IGNORE INTO audio_tracks VALUES (?,?,?,?)", t.id, t.chapterId, t.lang, t.duration);
      for (const s of t.segments) await d.runAsync("INSERT OR IGNORE INTO audio_timestamps VALUES (?,?,?,?)", t.id, s.verse, s.start, s.end);
    }
    await d.runAsync("INSERT OR REPLACE INTO meta VALUES ('seed_version', ?)", SEED_VERSION);
  });
}

export async function all<T = any>(table: UserTable): Promise<T[]> {
  if (hasSupabaseSession()) {
    const { data, error } = await getSupabase()
      .from("user_data")
      .select("data")
      .eq("table_name", table)
      .order("updated_at", { ascending: true });
    if (!error && data) {
      return data.map((row) => row.data as T);
    }
  }
  const rows = await db!.getAllAsync<{ data: string }>(`SELECT data FROM ${table} ORDER BY updated_at`);
  return rows.map((r) => JSON.parse(r.data));
}

export async function put(table: UserTable, row: { id: string; [k: string]: any }) {
  const updatedAt = new Date().toISOString();
  await db!.runAsync(`INSERT OR REPLACE INTO ${table} (id, data, updated_at) VALUES (?,?,?)`, row.id, JSON.stringify(row), updatedAt);

  if (hasSupabaseSession()) {
    const { data: { user } } = await getSupabase().auth.getUser();
    if (user) {
      await getSupabase().from("user_data").upsert({
        owner_id: user.id, table_name: table, row_id: row.id, data: row, updated_at: updatedAt,
      });
    }
  }
}

export async function del(table: UserTable, id: string) {
  await db!.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);

  if (hasSupabaseSession()) {
    await getSupabase().from("user_data").delete().eq("table_name", table).eq("row_id", id);
  }
}
