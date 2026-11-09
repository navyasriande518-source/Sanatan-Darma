import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { BOOKS, getBook, getVerse } from "@/src/data/content";
import { all, del, initDb, put } from "@/src/db";
import { LangCode, TKey, translate } from "@/src/i18n";
import type { ReaderBg } from "@/src/theme";

export type Prefs = {
  onboarded: boolean; uiLang: LangCode; readLang: LangCode; audioLang: LangCode;
  fontSize: number; fontFamily: "classic" | "traditional" | "system"; lineSpacing: number;
  readerBg: ReaderBg; readerDark: boolean; autoScroll: boolean; showAudioBar: boolean; keepAwake: boolean;
  showOriginal: boolean; showTranslit: boolean; showTranslation: boolean; showNotes: boolean;
  speed: number; volume: number; notif: { daily: boolean; books: boolean; reading: boolean; updates: boolean };
};
export const DEFAULT_PREFS: Prefs = {
  onboarded: false, uiLang: "en", readLang: "te", audioLang: "te", fontSize: 19, fontFamily: "classic", lineSpacing: 1.6,
  readerBg: "parchment", readerDark: false, autoScroll: true, showAudioBar: true, keepAwake: false,
  showOriginal: false, showTranslit: true, showTranslation: true, showNotes: true, speed: 1, volume: 1,
  notif: { daily: true, books: true, reading: false, updates: true },
};
export type Profile = { id: "me"; name: string; email: string; city: string; bio: string };
export type Bookmark = { id: string; type: "verse" | "chapter"; bookId: string; chapterId: string; verseId?: string; at: string };
export type Note = { id: string; verseId: string; bookId: string; chapterId: string; text: string; at: string };
export type Collection = { id: string; name: string; at: string };
export type CollectionItem = { id: string; collectionId: string };
export type Progress = { id: string; chapterId: string; verseId?: string; seen: string[]; updatedAt: string };
export type History = { id: string; bookId: string; chapterId: string; at: string };
export type Download = { id: string; kind: "book" | "audio"; refId: string; bytes: number; at: string };
export type Activity = { id: string; type: "read" | "listen" | "open_book" | "chapter_complete"; bookId?: string; chapterId?: string; seconds?: number; at: string };
export type Donation = { id: string; receiptNo: string; purpose: string; amount: number; at: string; demo: true };

type Data = {
  prefs: Prefs; profile: Profile | null; bookmarks: Bookmark[]; notes: Note[]; collections: Collection[];
  items: CollectionItem[]; progress: Progress[]; history: History[]; downloads: Download[]; activity: Activity[]; donations: Donation[];
};

const DEFAULT_COLLECTIONS = ["Daily Reading", "Important Verses", "Spiritual Wisdom", "Chanting", "Personal Study"];
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const now = () => new Date().toISOString();

function useAppState() {
  const [ready, setReady] = useState(false);
  const [d, setD] = useState<Data>({ prefs: DEFAULT_PREFS, profile: null, bookmarks: [], notes: [], collections: [], items: [], progress: [], history: [], downloads: [], activity: [], donations: [] });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langSheet, setLangSheet] = useState(false);
  const toastTimer = useRef<any>(null);

  useEffect(() => {
    (async () => {
      await initDb();
      const [prefsRows, users, bookmarks, notes, collections, items, progress, history, downloads, activity, donations] = await Promise.all([
        all<any>("user_preferences"), all<Profile>("users"), all<Bookmark>("bookmarks"), all<Note>("personal_notes"), all<Collection>("collections"),
        all<CollectionItem>("collection_items"), all<Progress>("reading_progress"), all<History>("reading_history"), all<Download>("downloads"),
        all<Activity>("activity_logs"), all<Donation>("donation_records"),
      ]);
      let cols = collections;
      if (!cols.length) {
        cols = DEFAULT_COLLECTIONS.map((name, i) => ({ id: `col-${i + 1}`, name, at: now() }));
        for (const c of cols) await put("collections", c);
      }
      const p = prefsRows.find((r) => r.id === "prefs");
      setD({ prefs: { ...DEFAULT_PREFS, ...(p?.value ?? {}) }, profile: users.find((u) => u.id === "me") ?? null, bookmarks, notes, collections: cols, items, progress, history, downloads, activity, donations });
      setReady(true);
    })();
  }, []);

  const t = useCallback((k: TKey, vars?: Record<string, string | number>) => translate(d.prefs.uiLang, k, vars), [d.prefs.uiLang]);
  const L = useCallback((x: { en: string; te?: string } | undefined, lang?: LangCode) => (x ? ((lang ?? d.prefs.uiLang) === "te" && x.te ? x.te : x.en) : ""), [d.prefs.uiLang]);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setD((s) => {
      const prefs = { ...s.prefs, ...patch };
      put("user_preferences", { id: "prefs", value: prefs } as any);
      return { ...s, prefs };
    });
  }, []);

  const saveProfile = useCallback(async (p: Omit<Profile, "id">) => {
    const profile: Profile = { id: "me", ...p };
    await put("users", profile);
    setD((s) => ({ ...s, profile }));
  }, []);

  const logout = useCallback(async () => {
    await del("users", "me");
    setD((s) => {
      const prefs = { ...s.prefs, onboarded: false };
      put("user_preferences", { id: "prefs", value: prefs } as any);
      return { ...s, profile: null, prefs };
    });
  }, []);

  const logActivity = useCallback((a: Omit<Activity, "id" | "at">) => {
    const row: Activity = { id: uid(), at: now(), ...a };
    put("activity_logs", row);
    setD((s) => ({ ...s, activity: [...s.activity, row] }));
  }, []);

  const toggleBookmark = useCallback((b: Omit<Bookmark, "id" | "at">) => {
    const id = b.type === "verse" ? b.verseId! : `ch:${b.chapterId}`;
    let added = false;
    setD((s) => {
      if (s.bookmarks.some((x) => x.id === id)) {
        del("bookmarks", id); del("collection_items", id);
        return { ...s, bookmarks: s.bookmarks.filter((x) => x.id !== id), items: s.items.filter((i) => i.id !== id) };
      }
      added = true;
      const row: Bookmark = { ...b, id, at: now() };
      put("bookmarks", row);
      return { ...s, bookmarks: [...s.bookmarks, row] };
    });
    return () => added;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    del("bookmarks", id); del("collection_items", id);
    setD((s) => ({ ...s, bookmarks: s.bookmarks.filter((x) => x.id !== id), items: s.items.filter((i) => i.id !== id) }));
  }, []);

  const saveNote = useCallback((verseId: string, text: string) => {
    const v = getVerse(verseId)!;
    if (!text.trim()) {
      del("personal_notes", verseId);
      setD((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== verseId) }));
      return;
    }
    const row: Note = { id: verseId, verseId, bookId: v.bookId, chapterId: v.chapterId, text: text.trim(), at: now() };
    put("personal_notes", row);
    setD((s) => ({ ...s, notes: [...s.notes.filter((n) => n.id !== verseId), row] }));
  }, []);

  const addCollection = useCallback((name: string) => {
    const row: Collection = { id: uid(), name: name.trim(), at: now() };
    put("collections", row);
    setD((s) => ({ ...s, collections: [...s.collections, row] }));
  }, []);

  const deleteCollection = useCallback((id: string) => {
    del("collections", id);
    setD((s) => {
      s.items.filter((i) => i.collectionId === id).forEach((i) => del("collection_items", i.id));
      return { ...s, collections: s.collections.filter((c) => c.id !== id), items: s.items.filter((i) => i.collectionId !== id) };
    });
  }, []);

  const setBookmarkCollection = useCallback((bookmarkId: string, collectionId: string | null) => {
    if (!collectionId) del("collection_items", bookmarkId);
    else put("collection_items", { id: bookmarkId, collectionId });
    setD((s) => ({ ...s, items: [...s.items.filter((i) => i.id !== bookmarkId), ...(collectionId ? [{ id: bookmarkId, collectionId }] : [])] }));
  }, []);

  const openBook = useCallback((bookId: string, chapterId: string) => {
    const row: History = { id: uid(), bookId, chapterId, at: now() };
    put("reading_history", row);
    logActivity({ type: "open_book", bookId, chapterId });
    setD((s) => ({ ...s, history: [...s.history, row] }));
  }, [logActivity]);

  const recordProgress = useCallback((bookId: string, chapterId: string, verseId?: string) => {
    setD((s) => {
      const prev = s.progress.find((p) => p.id === bookId);
      const seen = verseId && !prev?.seen.includes(verseId) ? [...(prev?.seen ?? []), verseId] : prev?.seen ?? [];
      const row: Progress = { id: bookId, chapterId, verseId: verseId ?? prev?.verseId, seen, updatedAt: now() };
      put("reading_progress", row);
      return { ...s, progress: [...s.progress.filter((p) => p.id !== bookId), row] };
    });
  }, []);

  const toggleDownload = useCallback((id: string, kind: "book" | "audio", bytes: number) => {
    let added = false;
    setD((s) => {
      if (s.downloads.some((x) => x.id === id)) {
        del("downloads", id);
        return { ...s, downloads: s.downloads.filter((x) => x.id !== id) };
      }
      added = true;
      const row: Download = { id, kind, refId: id, bytes, at: now() };
      put("downloads", row);
      return { ...s, downloads: [...s.downloads, row] };
    });
    return () => added;
  }, []);

  const addDonation = useCallback((purpose: string, amount: number) => {
    const row: Donation = { id: uid(), receiptNo: `DEMO-${Date.now().toString().slice(-8)}`, purpose, amount, at: now(), demo: true };
    put("donation_records", row);
    setD((s) => ({ ...s, donations: [...s.donations, row] }));
    return row;
  }, []);

  const bookPercent = useCallback((bookId: string) => {
    const b = getBook(bookId);
    const total = b ? b.chapters.reduce((n, c) => n + c.verses.length, 0) : 0;
    const seen = d.progress.find((p) => p.id === bookId)?.seen.length ?? 0;
    return total ? Math.round((seen / total) * 100) : 0;
  }, [d.progress]);

  const stats = useMemo(() => {
    const sum = (type: string) => d.activity.filter((a) => a.type === type).reduce((n, a) => n + (a.seconds ?? 0), 0);
    const days = new Set(d.activity.map((a) => a.at.slice(0, 10)));
    let streak = 0;
    const day = new Date();
    if (!days.has(day.toISOString().slice(0, 10))) day.setDate(day.getDate() - 1);
    while (days.has(day.toISOString().slice(0, 10))) { streak++; day.setDate(day.getDate() - 1); }
    return {
      readSec: sum("read"), listenSec: sum("listen"),
      booksOpened: new Set(d.activity.filter((a) => a.type === "open_book").map((a) => a.bookId)).size,
      chaptersCompleted: new Set(d.activity.filter((a) => a.type === "chapter_complete").map((a) => a.chapterId)).size,
      versesBookmarked: d.bookmarks.filter((b) => b.type === "verse").length,
      streak,
    };
  }, [d.activity, d.bookmarks]);

  const lastRead = useMemo(() => [...d.progress].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0], [d.progress]);
  const recentBooks = useMemo(() => {
    const ids: string[] = [];
    [...d.history].sort((a, b) => b.at.localeCompare(a.at)).forEach((h) => { if (!ids.includes(h.bookId)) ids.push(h.bookId); });
    return ids.map((id) => BOOKS.find((b) => b.id === id)!).filter(Boolean);
  }, [d.history]);

  return {
    ready, ...d, t, L, toast, toastMsg, menuOpen, setMenuOpen, langSheet, setLangSheet,
    setPrefs, saveProfile, logout, logActivity, toggleBookmark, removeBookmark, saveNote, addCollection, deleteCollection,
    setBookmarkCollection, openBook, recordProgress, toggleDownload, addDonation, bookPercent, stats, lastRead, recentBooks,
  };
}

type AppCtx = ReturnType<typeof useAppState>;
const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useAppState();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  return useContext(Ctx)!;
}
