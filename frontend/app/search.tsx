import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { EmptyState, Icon, Txt } from "@/src/components/ui";
import { getBook, getChapter } from "@/src/data/content";
import { searchVerses } from "@/src/lib/verseSearch";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Search() {
  const { t, prefs } = useApp();
  const { colors } = useTheme();
  const s = useStyles();
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchVerses(query), [query]);

  return (
    <Screen testID="verse-search-screen" back title={t("searchVerses")}>
      <View style={s.search}>
        <Icon name="magnify" size={22} color={colors.maroon} />
        <TextInput testID="verse-search-input" autoFocus value={query} onChangeText={setQuery} placeholder={t("searchVerseHint")} placeholderTextColor={colors.muted} style={s.input} returnKeyType="search" />
        {query ? <Pressable onPress={() => setQuery("")} hitSlop={8}><Icon name="close-circle" size={18} color={colors.muted} /></Pressable> : null}
      </View>
      {query.trim() ? <Txt size={13} color={colors.muted} style={{ marginVertical: spacing.md }}>{results.length} {t("verseResults")}</Txt> : null}
      {!query.trim() ? <EmptyState icon="text-search" text={t("searchVerseHint")} /> : results.length ? results.map((verse) => {
        const book = getBook(verse.bookId)!;
        const chapter = getChapter(verse.chapterId)!;
        return (
          <Pressable key={verse.id} testID={`search-result-${verse.ref}`} onPress={() => router.push(`/verse/${verse.id}`)} style={s.result}>
            <View style={s.ref}><Txt v="bold" size={15} color={colors.maroon}>{verse.ref}</Txt><Txt size={12} color={colors.muted}>{chapter.number} · {book.title.en}</Txt></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={16} numberOfLines={2} style={{ fontFamily: prefs.readLang === "te" ? "NotoTelugu" : "Crimson" }}>{prefs.readLang === "te" ? verse.te ?? verse.en : verse.en}</Txt>
              <Txt size={13} color={colors.muted} numberOfLines={1}>{verse.iast ?? verse.sa}</Txt>
            </View>
            <Icon name="chevron-right" size={22} color={colors.maroon} />
          </Pressable>
        );
      }) : <EmptyState icon="text-search" text={t("noVerseResults")} />}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  search: { height: 50, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: c.ivory, borderRadius: radius.pill, borderWidth: 1, borderColor: c.cardBorder, paddingHorizontal: spacing.md },
  input: { flex: 1, height: 48, color: c.onSurface, fontFamily: "Crimson", fontSize: 16 },
  result: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: c.ivory, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder },
  ref: { width: 62, gap: 4 },
}));
