import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Badge, Card, EmptyState, GoldButton, Icon, LotusDivider, ProgressBar, SectionTitle, Txt, fmtBytes } from "@/src/components/ui";
import { AUDIO_TRACKS, CATEGORIES, bookBytes, firstReadableChapter, getBook } from "@/src/data/content";
import { LANGUAGES } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function BookDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const { t, L, bookPercent, progress, downloads, bookmarks } = app;
  const s = useStyles();
  const { colors } = useTheme();
  const book = getBook(id);
  if (!book) return <Screen back title={t("books")}><EmptyState icon="book-remove-outline" text={t("noResults")} /></Screen>;

  const cat = CATEGORIES.find((c) => c.id === book.categoryId);
  const pct = bookPercent(book.id);
  const prog = progress.find((p) => p.id === book.id);
  const startCh = prog ? book.chapters.find((c) => c.id === prog.chapterId) ?? firstReadableChapter(book) : firstReadableChapter(book);
  const tracks = AUDIO_TRACKS.filter((a) => a.bookId === book.id);
  const isDl = downloads.some((d) => d.id === book.id);
  const bmId = startCh ? `ch:${startCh.id}` : "";
  const isBm = bookmarks.some((b) => b.id === bmId);
  const readableCount = book.chapters.reduce((n, c) => n + c.verses.length, 0);

  const toggleDl = () => {
    app.toggleDownload(book.id, "book", bookBytes(book));
    tracks.forEach((tr) => { if (isDl === downloads.some((d) => d.id === tr.id)) app.toggleDownload(tr.id, "audio", tr.bytes); });
    app.toast(isDl ? t("delete") : t("downloaded"));
  };

  return (
    <Screen testID="book-details-screen" back title={L(book.title)}>
      <View style={s.top}>
        <Image source={book.cover} style={s.cover} contentFit="cover" />
        <View style={{ flex: 1, gap: 6 }}>
          <Txt testID="book-title" v="heading" size={22} color={colors.maroon}>{L(book.title)}</Txt>
          <Txt size={14} color={colors.muted}>{L(cat?.name)} · {L(book.sections)}</Txt>
          <Badge label={book.edition === "demo" ? t("demoExcerpt") : t("catalogue")} tone={book.edition === "demo" ? "gold" : "maroon"} />
          <Txt size={13}>{t("languages")}: {book.languages.map((l) => LANGUAGES.find((x) => x.code === l)?.native).join(" · ")}</Txt>
          <Txt size={13} color={tracks.length ? colors.success : colors.muted}>♪ {tracks.length ? t("audioAvailable") : t("noAudio")}</Txt>
        </View>
      </View>

      <Txt size={16} style={{ marginVertical: spacing.md }}>{L(book.description)}</Txt>
      <View style={s.btnRow}>
        <GoldButton testID="book-start-reading" style={{ flex: 1 }} label={prog ? t("continueBtn") : t("startReading")} icon="book-open-variant" onPress={() => router.push(`/reader/${book.id}?chapter=${startCh?.number ?? 1}`)} />
      </View>
      <View style={[s.btnRow, { marginTop: spacing.sm }]}>
        <GoldButton testID="book-download-button" style={{ flex: 1 }} variant="cream" label={isDl ? t("downloaded") : t("download")} icon={isDl ? "check-circle" : "download-outline"} onPress={toggleDl} />
        <GoldButton testID="book-bookmark-button" style={{ flex: 1 }} variant="cream" label={isBm ? t("bookmarked") : t("bookmark")} icon={isBm ? "bookmark" : "bookmark-outline"}
          onPress={() => { if (!startCh) return; app.toggleBookmark({ type: "chapter", bookId: book.id, chapterId: startCh.id }); app.toast(isBm ? t("bookmarkRemoved") : t("bookmarkAdded")); }} />
      </View>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Txt v="bold" size={16} color={colors.maroon}>{t("progress")}</Txt>
          <Txt testID="book-progress-value" v="bold" size={16} color={colors.gold}>{pct}%</Txt>
        </View>
        <ProgressBar value={pct} />
        <Txt size={13} color={colors.muted} style={{ marginTop: 6 }}>{readableCount ? t("versesIncluded", { n: readableCount }) : t("catalogueInfo")} · {fmtBytes(bookBytes(book) + tracks.reduce((n, x) => n + x.bytes, 0))}</Txt>
      </Card>

      <LotusDivider />
      <SectionTitle title={t("about")} />
      <Txt size={15}>{L(book.about)}</Txt>
      <Txt size={15} style={{ marginTop: spacing.sm }}><Txt v="bold" size={15} color={colors.maroon}>{t("attribution")}: </Txt>{L(book.attribution)}</Txt>
      <Txt size={13} color={colors.muted} style={{ marginTop: spacing.sm, fontStyle: "italic" }}>{t("source")}: {book.source}</Txt>

      <LotusDivider />
      <SectionTitle title={t("toc")} />
      {book.chapters.length === 0 ? <Txt size={15} color={colors.muted}>{t("catalogueInfo")}</Txt> : null}
      {book.chapters.map((c) => (
        <Pressable key={c.id} testID={`toc-chapter-${c.number}`} onPress={() => router.push(`/reader/${book.id}?chapter=${c.number}`)} style={({ pressed }) => [s.ch, pressed && { backgroundColor: colors.highlight }]}>
          <View style={s.num}><Txt v="bold" size={14} color={colors.goldLight}>{c.number}</Txt></View>
          <View style={{ flex: 1 }}>
            <Txt v="semi" size={15} color={colors.maroon} numberOfLines={2}>{L(c.title)}</Txt>
            <Txt size={12} color={colors.muted} numberOfLines={1}>
              {c.verseCount ? `${c.verseCount} ${t("verses").toLowerCase()} · ` : ""}{c.verses.length ? t("versesIncluded", { n: c.verses.length }) : t("catalogueInfo")}
            </Txt>
          </View>
          {AUDIO_TRACKS.some((a) => a.chapterId === c.id) ? <Icon name="headphones" size={18} color={colors.gold} /> : null}
          <Icon name={c.verses.length ? "book-open-variant" : "lock-clock"} size={18} color={c.verses.length ? colors.maroon : colors.divider} />
        </Pressable>
      ))}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  top: { flexDirection: "row", gap: spacing.md },
  cover: { width: 120, height: 150, borderRadius: radius.md, borderWidth: 2, borderColor: c.gold },
  btnRow: { flexDirection: "row", gap: spacing.sm },
  ch: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: c.divider, minHeight: 56, borderRadius: radius.sm },
  num: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.maroon, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.gold },
}));
