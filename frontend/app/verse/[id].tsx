import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Share, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Card, EmptyState, GoldButton, Txt } from "@/src/components/ui";
import { dailyVerse, getBook, getChapter, getVerse } from "@/src/data/content";
import { toTelugu } from "@/src/lib/translit";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

// Full verse view: original, transliterations, translations and note in separate fields.
export default function VerseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, L, prefs, bookmarks, toggleBookmark, toast } = useApp();
  const { colors } = useTheme();
  const v = id === "daily" ? dailyVerse() : getVerse(id);
  if (!v) return <Screen back title={t("verse")}><EmptyState icon="book-remove-outline" text={t("noResults")} /></Screen>;
  const b = getBook(v.bookId)!;
  const c = getChapter(v.chapterId)!;
  const isBm = bookmarks.some((x) => x.id === v.id);
  const Block = ({ label, text, font, testID }: { label: string; text?: string; font?: string; testID: string }) => text ? (
    <Card testID={testID} style={{ marginBottom: spacing.md }}>
      <Txt v="bold" size={14} color={colors.gold} style={{ marginBottom: 6 }}>{label.toUpperCase()}</Txt>
      <Txt style={{ fontFamily: font, fontSize: 18, lineHeight: 30, color: colors.burgundy }}>{text}</Txt>
    </Card>
  ) : null;
  return (
    <Screen testID="verse-detail-screen" back title={id === "daily" ? t("dailyVerse") : `${t("verse")} ${v.ref}`}>
      <Txt v="heading" size={20} color={colors.maroon} style={{ textAlign: "center" }}>{L(b.title)} · {v.ref}</Txt>
      <Txt size={14} color={colors.muted} style={{ textAlign: "center", marginBottom: spacing.md }}>{L(c.title)}</Txt>
      <Block testID="verse-detail-original" label={t("original")} text={v.sa} font="NotoDeva" />
      <Block testID="verse-detail-telugu-script" label={`${t("transliteration")} · తెలుగు`} text={toTelugu(v.sa)} font="NotoTelugu" />
      <Block testID="verse-detail-iast" label={`${t("transliteration")} · IAST`} text={v.iast} font="Crimson" />
      <Block testID="verse-detail-en" label={`${t("translation")} · English`} text={v.en} font="Crimson" />
      <Block testID="verse-detail-te" label={`${t("meaning")} · తెలుగు`} text={v.te} font="NotoTelugu" />
      <Block testID="verse-detail-note" label={t("commentary")} text={v.noteEn} font="Crimson" />
      <Txt size={13} color={colors.muted} style={{ fontStyle: "italic", marginBottom: spacing.md }}>{t("source")}: {b.source}</Txt>
      <View style={{ gap: spacing.sm }}>
        <GoldButton testID="verse-detail-open-reader" label={t("open")} icon="book-open-variant" onPress={() => router.push(`/reader/${b.id}?chapter=${c.number}&verse=${v.n}`)} />
        <GoldButton testID="verse-detail-bookmark" variant="cream" label={isBm ? t("removeBookmark") : t("addBookmark")} icon={isBm ? "bookmark" : "bookmark-outline"} onPress={() => { toggleBookmark({ type: "verse", bookId: b.id, chapterId: c.id, verseId: v.id }); toast(isBm ? t("bookmarkRemoved") : t("bookmarkAdded")); }} />
        <GoldButton testID="verse-detail-share" variant="cream" label={t("share")} icon="share-variant-outline" onPress={() => Share.share({ message: `${L(b.title, prefs.readLang)} ${v.ref}\n\n${v.sa}\n\n${prefs.readLang === "te" ? v.te ?? v.en : v.en}` })} />
      </View>
    </Screen>
  );
}
