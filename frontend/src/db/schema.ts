// Shared schema description for the local database.
export const USER_TABLES = [
  "users", "user_preferences", "bookmarks", "personal_notes", "collections", "collection_items",
  "reading_history", "reading_progress", "downloads", "notifications", "reading_plans",
  "activity_logs", "donation_records",
] as const;
export type UserTable = (typeof USER_TABLES)[number];

// Content tables (seeded from src/data/content.ts on native SQLite).
export const CONTENT_SQL = `
CREATE TABLE IF NOT EXISTS book_categories (id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_te TEXT, icon TEXT);
CREATE TABLE IF NOT EXISTS books (id TEXT PRIMARY KEY, category_id TEXT NOT NULL REFERENCES book_categories(id), title_en TEXT NOT NULL, title_te TEXT, attribution_en TEXT, description_en TEXT, edition TEXT, source TEXT);
CREATE TABLE IF NOT EXISTS book_languages (book_id TEXT NOT NULL REFERENCES books(id), lang TEXT NOT NULL, PRIMARY KEY (book_id, lang));
CREATE TABLE IF NOT EXISTS chapters (id TEXT PRIMARY KEY, book_id TEXT NOT NULL REFERENCES books(id), number INTEGER NOT NULL, title_en TEXT, title_te TEXT, verse_count INTEGER);
CREATE TABLE IF NOT EXISTS verses (id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL REFERENCES chapters(id), book_id TEXT NOT NULL, n INTEGER NOT NULL, ref TEXT, original_sa TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS translations (verse_id TEXT NOT NULL REFERENCES verses(id), lang TEXT NOT NULL, text TEXT NOT NULL, PRIMARY KEY (verse_id, lang));
CREATE TABLE IF NOT EXISTS transliterations (verse_id TEXT NOT NULL REFERENCES verses(id), scheme TEXT NOT NULL, text TEXT NOT NULL, PRIMARY KEY (verse_id, scheme));
CREATE TABLE IF NOT EXISTS commentaries (verse_id TEXT NOT NULL REFERENCES verses(id), lang TEXT NOT NULL, text TEXT NOT NULL, PRIMARY KEY (verse_id, lang));
CREATE TABLE IF NOT EXISTS audio_tracks (id TEXT PRIMARY KEY, chapter_id TEXT NOT NULL REFERENCES chapters(id), lang TEXT NOT NULL, duration REAL);
CREATE TABLE IF NOT EXISTS audio_timestamps (track_id TEXT NOT NULL REFERENCES audio_tracks(id), verse_n INTEGER NOT NULL, start_s REAL NOT NULL, end_s REAL NOT NULL, PRIMARY KEY (track_id, verse_n));
CREATE TABLE IF NOT EXISTS daily_verses (verse_id TEXT PRIMARY KEY REFERENCES verses(id));
CREATE INDEX IF NOT EXISTS idx_books_cat ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(chapter_id);
`;
