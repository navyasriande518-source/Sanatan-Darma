# Sanatana Dharma – Digital Library (Phase 1 Prototype)

Expo (React Native, SDK 58) app. Runs fully offline, with no backend, cloud database or paid API needed at runtime.

## Run / Install
- Preview: scan the Expo Go QR code in Emergent, or open the web preview.
- Installable Android/iOS build: click **Publish** (top-right in Emergent). Then generate the Android APK/AAB (or iOS build) from the deployment panel.

## Architecture
```
app/                      expo-router screens
  (tabs)/ index, books, bookmarks, settings   bottom navigation (custom maroon/gold bar)
  language, book/[id], reader/[bookId], verse/[id], activity, profile, notifications,
  dana, downloads, reading-prefs, fonts, info/[page], mantras, continue, coming-soon
src/data/content.ts       seed library: categories, 15 books, chapters, verses, audio tracks, mantras
src/data/gita7.json       Bhagavad Gita ch.7 verses (sa / iast / en / te / note)
src/data/audioTimings.json per-verse audio timestamps (start/end seconds)
assets/audio/             bundled DEMO narration (AI-generated, labelled in-app)
src/db/index.ts           native SQLite (expo-sqlite): schema + idempotent seeding (INSERT OR IGNORE + seed_version)
src/db/index.web.ts       web-preview fallback with the same API (local storage)
src/db/schema.ts          table list + content table DDL
src/store/AppContext.tsx  app state, persistence, activity statistics
src/i18n/                 en.ts, te.ts, language registry (index.ts)
src/lib/translit.ts       Devanagari -> Telugu script transliteration
src/lib/player.ts         single shared expo-audio player
```

### Database tables
Content (seeded): book_categories, books, book_languages, chapters, verses, translations, transliterations, commentaries, audio_tracks, audio_timestamps, daily_verses.
User (persisted): users, user_preferences, bookmarks, personal_notes, collections, collection_items, reading_history, reading_progress, downloads, notifications, reading_plans, activity_logs, donation_records.

The original text, transliteration, translation and commentary are stored in separate fields and tables.

## Adding content
- **Book**: add an entry to `BOOKS` in `src/data/content.ts`, with `edition: "demo" | "catalogue"`, a `source` line and a cover in `assets/images/art/`.
- **Chapter / verses**: add `{ number, title, verses: [{ n, ref, sa, iast, en, te, noteEn }] }`. The Telugu-script reading is generated from `sa` automatically. Bump `SEED_VERSION` in `src/db/index.ts` so native SQLite picks up the new rows.
- **Audio**: put an mp3 in `assets/audio/` and add an `AUDIO_TRACKS` entry with `segments: [{ verse, start, end }]`. `backend/scripts/gen_audio.py` shows how the demo tracks and timestamps were produced.
- **Language**: create `src/i18n/<code>.ts` (copy `en.ts`), register it in `DICTS`, and set `enabled: true` in `LANGUAGES`. Any missing key falls back to English.

## Content honesty
- The Sanskrit texts come from traditional public-domain recensions.
- The Rig Veda and Sama Veda English renderings are by R.T.H. Griffith (public domain).
- All other English and Telugu meanings are prototype renderings. They are labelled in the app as pending scholarly review.
- Catalogue-only books (Mahabharata, Bhagavata, Vishnu, Shiva Purana, Manusmriti) contain no text.
- The Dana screens are demo-only: no payment is collected.
