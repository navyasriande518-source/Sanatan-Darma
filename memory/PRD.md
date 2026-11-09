# PRD – Sanatana Dharma Digital Library (Phase 1)

## Original problem statement
Multilingual (Telugu/English) digital library of Hindu scriptures. Mobile-first Expo app, fully offline with local data and the attached maroon/gold design. Features: Home dashboard, Books library (search + 10 categories, 15 books), Book details, traditional reader (Gita Ch.7 primary), audio with verse-synced highlighting, Bookmarks with collections and notes, Settings, Language selection (3 separate prefs), hamburger drawer, activity analytics, demo Dana, downloads/offline. No paid APIs at runtime and no invented scripture.

## User choices
- Real spoken demo audio: AI-generated once and bundled.
- Header art cut from the user's screenshots.
- Logout clears the profile and keeps the library.

## Architecture
- Expo Router (SDK 58) app.
- Local DB: expo-sqlite on native (schema + idempotent seed), localStorage fallback on web.
- State: React context (`src/store/AppContext.tsx`).
- i18n: registry with en/te; 6 more languages are pre-registered as disabled.
- Content: `src/data/content.ts` and `gita7.json`.
- Audio: expo-audio with a single shared player and timestamp JSON.
- Backend is unused at runtime. `backend/scripts/gen_audio.py` generated the demo audio.
- Docs: `/app/frontend/DOCS.md`.

## Implemented (2026-06)
- All screens: Home, Books, Book details, Reader, Bookmarks, Settings, Language, Drawer, Activity, Profile, Notifications, Dana + receipt, Downloads, Reading prefs, Fonts, Info pages, Mantras, Verse detail, Coming Soon.
- Gita: 18 chapters; 7.1–7.8 with Sanskrit, Telugu script, IAST, English and Telugu meaning, plus demo narration in Telugu and English.
- Excerpts: Ramayana, Vedas, Upanishads, Yoga/Brahma/Narada sutras. Catalogue-only entries are labelled as such.
- Persistence of prefs, bookmarks, notes, progress, history, downloads, activity and donations.
- Tested in 2 iterations; all flows pass.

## Backlog
- P1: Complete Gita text; verified Telugu translations; professional narration.
- P1: Audio for more chapters; full-text search across verses.
- P2: Cloud sync/auth, real notifications, quiz, calendar, satsang, real donations.
