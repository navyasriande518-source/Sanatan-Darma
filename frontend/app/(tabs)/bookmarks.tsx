import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Sheet } from "@/src/components/Sheet";
import { Chip, EmptyState, GoldButton, Icon, Txt } from "@/src/components/ui";
import { BOOKS, getBook, getChapter, getVerse } from "@/src/data/content";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Tab = "all" | "verses" | "chapters" | "notes";
type Item = { id: string; kind: "verse" | "chapter" | "note"; bookId: string; chapterId: string; verseId?: string; at: string; text?: string };

export default function Bookmarks() {
  const params = useLocalSearchParams<{ tab?: Tab; collections?: string }>();
  const app = useApp();
  const { t, L, bookmarks, notes, collections, items, prefs } = app;
  const s = useStyles();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>(params.tab ?? "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "book">("new");
  const [fBook, setFBook] = useState<string | null>(null);
  const [fCh, setFCh] = useState<string | null>(null);
  const [fCol, setFCol] = useState<string | null>(null);
  const [sheet, setSheet] = useState<null | "filter" | "collections" | "move">(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [newCol, setNewCol] = useState("");

  useEffect(() => { setTab(params.tab ?? "all"); if (params.collections) setSheet("collections"); }, [params.tab, params.collections]);

  const all: Item[] = useMemo(() => [
    ...bookmarks.map((b) => ({ id: b.id, kind: b.type, bookId: b.bookId, chapterId: b.chapterId, verseId: b.verseId, at: b.at })),
    ...notes.map((n) => ({ id: `note:${n.id}`, kind: "note" as const, bookId: n.bookId, chapterId: n.chapterId, verseId: n.verseId, at: n.at, text: n.text })),
  ], [bookmarks, notes]);
  const counts = { all: all.length, verses: all.filter((i) => i.kind === "verse").length, chapters: all.filter((i) => i.kind === "chapter").length, notes: all.filter((i) => i.kind === "note").length };

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let r = all.filter((i) => tab === "all" || (tab === "verses" && i.kind === "verse") || (tab === "chapters" && i.kind === "chapter") || (tab === "notes" && i.kind === "note"));
    if (fBook) r = r.filter((i) => i.bookId === fBook);
    if (fCh) r = r.filter((i) => i.chapterId === fCh);
    if (fCol) r = r.filter((i) => items.find((x) => x.id === i.id)?.collectionId === fCol);
    if (needle) r = r.filter((i) => {
      const b = getBook(i.bookId); const v = i.verseId ? getVerse(i.verseId) : undefined; const c = getChapter(i.chapterId);
      return [b?.title.en, b?.title.te, c?.title.en, c?.title.te, v?.en, v?.te, v?.ref, i.text].join(" ").toLowerCase().includes(needle);
    });
    return r.sort((a, b) => sort === "new" ? b.at.localeCompare(a.at) : sort === "old" ? a.at.localeCompare(b.at) : a.bookId.localeCompare(b.bookId));
  }, [all, tab, q, sort, fBook, fCh, fCol, items]);

  const open = (i: Item) => {
    const c = getChapter(i.chapterId)!; const v = i.verseId ? getVerse(i.verseId) : undefined;
    router.push(`/reader/${i.bookId}?chapter=${c.number}${v ? `&verse=${v.n}` : ""}`);
  };
  const remove = (i: Item) => {
    if (i.kind === "note") app.saveNote(i.verseId!, "");
    else app.removeBookmark(i.id);
    app.toast(t("bookmarkRemoved"));
  };
  const sortNext = () => setSort(sort === "new" ? "old" : sort === "old" ? "book" : "new");
  const fBookObj = fBook ? getBook(fBook) : undefined;
  const te = prefs.readLang === "te";

  const sticky = (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} contentContainerStyle={s.chips}>
        {(["all", "verses", "chapters", "notes"] as Tab[]).map((k) => (
          <Chip key={k} testID={`bookmarks-tab-${k}`} label={`${t(k)} (${counts[k]})`} icon={k === "verses" ? "format-quote-open" : k === "chapters" ? "book-open-page-variant-outline" : k === "notes" ? "pencil-outline" : undefined} active={tab === k} onPress={() => setTab(k)} />
        ))}
      </ScrollView>
      <View style={s.searchRow}>
        <View style={s.search}>
          <Icon name="magnify" size={22} color={colors.maroon} />
          <TextInput testID="bookmarks-search-input" value={q} onChangeText={setQ} placeholder={t("searchBookmarks")} placeholderTextColor={colors.muted} style={s.input} />
        </View>
        <Pressable testID="bookmarks-sort-button" onPress={sortNext} style={s.sqBtn}><Icon name="swap-vertical" size={22} color={colors.maroon} /></Pressable>
        <Pressable testID="bookmarks-filter-button" onPress={() => setSheet("filter")} style={[s.sqBtn, (fBook || fCh) && s.sqActive]}><Icon name="filter-variant" size={22} color={colors.maroon} /></Pressable>
        <Pressable testID="bookmarks-collections-button" onPress={() => setSheet("collections")} style={[s.sqBtn, fCol && s.sqActive]}><Icon name="folder-outline" size={22} color={colors.maroon} /></Pressable>
      </View>
      <Txt testID="bookmarks-sort-label" size={13} color={colors.muted} style={{ paddingHorizontal: spacing.lg, paddingTop: 6 }}>
        {sort === "new" ? t("sortNewest") : sort === "old" ? t("sortOldest") : t("sortBook")}{fBookObj ? ` · ${L(fBookObj.title)}` : ""}{fCol ? ` · ${collections.find((c) => c.id === fCol)?.name}` : ""}
      </Txt>
    </View>
  );

  return (
    <Screen testID="bookmarks-screen" title={t("bookmarks")} icon="bookmark-outline" sticky={sticky} tab>
      {list.length === 0 ? <EmptyState testID="bookmarks-empty" icon="bookmark-outline" text={tab === "notes" ? t("noNotes") : t("noBookmarks")} /> : null}
      {list.map((i) => {
        const b = getBook(i.bookId)!; const c = getChapter(i.chapterId)!; const v = i.verseId ? getVerse(i.verseId) : undefined;
        const col = collections.find((x) => x.id === items.find((it) => it.id === i.id)?.collectionId);
        const title = v ? `${L(b.chapterLabel)} ${c.number} – ${t("verse")} ${v.ref}` : `${L(c.title)}`;
        const snippet = i.kind === "note" ? i.text : v ? (te ? v.te ?? v.en : v.en) : L(c.description) || L(b.title);
        return (
          <Pressable key={i.id} testID={`bookmark-item-${i.id}`} onPress={() => open(i)} style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}>
            <Image source={b.cover} style={s.thumb} contentFit="cover" />
            <View style={{ flex: 1, gap: 4 }}>
              <Txt v="heading" size={16} color={colors.maroon} numberOfLines={1}>{title}</Txt>
              <Txt size={14} numberOfLines={2} style={te && v && i.kind !== "note" ? { fontFamily: "NotoTelugu" } : undefined}>{i.kind === "note" ? "✎ " : "“"}{snippet}{i.kind === "note" ? "" : "”"}</Txt>
              <View style={s.tags}>
                <View style={s.tag}><Icon name="book-open-page-variant-outline" size={13} color={colors.maroon} /><Txt size={12} color={colors.maroon} numberOfLines={1}>{L(b.title)}</Txt></View>
                {col ? <View style={[s.tag, s.tagGold]}><Icon name="folder" size={13} color={colors.maroon} /><Txt size={12} color={colors.maroon}>{col.name}</Txt></View> : null}
              </View>
            </View>
            <View style={{ gap: spacing.sm, alignItems: "center" }}>
              <Pressable testID={`bookmark-remove-${i.id}`} onPress={() => remove(i)} hitSlop={12} style={s.iconBtn}>
                <Icon name={i.kind === "note" ? "delete-outline" : "bookmark"} size={24} color={colors.maroon} />
              </Pressable>
              {i.kind !== "note" ? (
                <Pressable testID={`bookmark-move-${i.id}`} onPress={() => { setMoving(i.id); setSheet("move"); }} hitSlop={12} style={s.iconBtn}>
                  <Icon name="folder-move-outline" size={22} color={colors.gold} />
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        );
      })}

      <Sheet testID="bookmarks-filter-sheet" visible={sheet === "filter"} onClose={() => setSheet(null)} title={t("filter")}>
        <Txt v="bold" size={15} color={colors.maroon} style={s.fl}>{t("filterBook")}</Txt>
        <View style={s.wrap}>
          <Chip testID="bm-filter-book-any" label={t("any")} active={!fBook} onPress={() => { setFBook(null); setFCh(null); }} />
          {BOOKS.filter((b) => all.some((i) => i.bookId === b.id)).map((b) => <Chip key={b.id} testID={`bm-filter-book-${b.id}`} label={L(b.title)} active={fBook === b.id} onPress={() => { setFBook(b.id); setFCh(null); }} />)}
        </View>
        {fBookObj ? (
          <>
            <Txt v="bold" size={15} color={colors.maroon} style={s.fl}>{t("filterChapter")}</Txt>
            <View style={s.wrap}>
              <Chip testID="bm-filter-ch-any" label={t("any")} active={!fCh} onPress={() => setFCh(null)} />
              {fBookObj.chapters.filter((c) => all.some((i) => i.chapterId === c.id)).map((c) => <Chip key={c.id} testID={`bm-filter-ch-${c.number}`} label={`${L(fBookObj.chapterLabel)} ${c.number}`} active={fCh === c.id} onPress={() => setFCh(c.id)} />)}
            </View>
          </>
        ) : null}
        <GoldButton testID="bm-filter-clear" style={{ marginTop: spacing.lg }} variant="cream" label={t("clearFilters")} onPress={() => { setFBook(null); setFCh(null); setFCol(null); setSheet(null); }} />
      </Sheet>

      <Sheet testID="collections-sheet" visible={sheet === "collections"} onClose={() => setSheet(null)} title={t("myCollections")}>
        <Pressable testID="collection-filter-none" onPress={() => { setFCol(null); setSheet(null); }} style={[s.colRow, !fCol && s.colActive]}>
          <Icon name="folder-multiple-outline" size={22} color={colors.maroon} /><Txt v="semi" size={16} style={{ flex: 1 }}>{t("all")}</Txt>
        </Pressable>
        {collections.map((c) => (
          <Pressable key={c.id} testID={`collection-${c.id}`} onPress={() => { setFCol(c.id); setSheet(null); }} style={[s.colRow, fCol === c.id && s.colActive]}>
            <Icon name="folder" size={22} color={colors.gold} />
            <Txt v="semi" size={16} style={{ flex: 1 }}>{c.name}</Txt>
            <Txt size={13} color={colors.muted}>{items.filter((i) => i.collectionId === c.id).length}</Txt>
            <Pressable testID={`collection-delete-${c.id}`} onPress={() => { app.deleteCollection(c.id); if (fCol === c.id) setFCol(null); }} hitSlop={8}><Icon name="delete-outline" size={20} color={colors.maroon} /></Pressable>
          </Pressable>
        ))}
        <View style={s.newRow}>
          <TextInput testID="new-collection-input" value={newCol} onChangeText={setNewCol} placeholder={t("collectionName")} placeholderTextColor={colors.muted} style={[s.input, s.newInput]} />
          <Pressable testID="new-collection-add" onPress={() => { if (newCol.trim()) { app.addCollection(newCol); setNewCol(""); app.toast(t("saved")); } }} style={s.addBtn}><Icon name="plus" size={24} color={colors.ivory} /></Pressable>
        </View>
      </Sheet>

      <Sheet testID="move-sheet" visible={sheet === "move"} onClose={() => setSheet(null)} title={t("addToCollection")}>
        <Pressable testID="move-to-none" onPress={() => { if (moving) app.setBookmarkCollection(moving, null); setSheet(null); }} style={s.colRow}>
          <Icon name="folder-remove-outline" size={22} color={colors.maroon} /><Txt v="semi" size={16}>{t("none")}</Txt>
        </Pressable>
        {collections.map((c) => (
          <Pressable key={c.id} testID={`move-to-${c.id}`} onPress={() => { if (moving) app.setBookmarkCollection(moving, c.id); app.toast(`${t("saved")} · ${c.name}`); setSheet(null); }} style={[s.colRow, items.find((i) => i.id === moving)?.collectionId === c.id && s.colActive]}>
            <Icon name="folder" size={22} color={colors.gold} /><Txt v="semi" size={16}>{c.name}</Txt>
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  chipsRow: { height: 56, flexGrow: 0 },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  searchRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" },
  search: { flex: 1, height: 46, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: c.ivory, borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: spacing.md },
  input: { flex: 1, fontSize: 16, color: c.onSurface, fontFamily: "Crimson", height: 44 },
  sqBtn: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center" },
  sqActive: { backgroundColor: c.highlight, borderColor: c.gold },
  card: { flexDirection: "row", gap: spacing.md, padding: spacing.md, backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, marginBottom: spacing.md, elevation: 2, shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  iconBtn: { width: 44, height: 40, alignItems: "center", justifyContent: "center" },
  thumb: { width: 84, height: 84, borderRadius: radius.md, borderWidth: 1, borderColor: c.gold },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: c.parchment, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: c.cardBorder, maxWidth: 160 },
  tagGold: { backgroundColor: c.highlight },
  fl: { marginTop: spacing.md, marginBottom: spacing.sm },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  colRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: c.divider, marginBottom: spacing.sm, minHeight: 50 },
  colActive: { backgroundColor: c.highlight, borderColor: c.gold },
  newRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  newInput: { borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: c.parchment },
  addBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: c.maroon, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: c.gold },
}));
