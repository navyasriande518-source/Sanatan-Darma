import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Card, EmptyState, Icon, ProgressBar, SectionTitle, Txt } from "@/src/components/ui";
import { getBook, getChapter, getVerse } from "@/src/data/content";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const mins = (s: number) => Math.round(s / 60);

export default function Activity() {
  const { t, L, stats, lastRead, history, progress, bookPercent, prefs } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const cards = [
    { k: "totalReading" as const, v: t("minutes", { n: mins(stats.readSec) }), icon: "book-clock-outline", id: "reading-time" },
    { k: "totalListening" as const, v: t("minutes", { n: mins(stats.listenSec) }), icon: "headphones", id: "listening-time" },
    { k: "booksOpened" as const, v: stats.booksOpened, icon: "bookshelf", id: "books-opened" },
    { k: "chaptersCompleted" as const, v: stats.chaptersCompleted, icon: "check-decagram-outline", id: "chapters-completed" },
    { k: "versesBookmarked" as const, v: stats.versesBookmarked, icon: "bookmark-multiple-outline", id: "verses-bookmarked" },
    { k: "streak" as const, v: stats.streak, icon: "fire", id: "streak" },
  ];
  const lb = lastRead ? getBook(lastRead.id) : undefined;
  const lc = lastRead ? getChapter(lastRead.chapterId) : undefined;
  const lv = lastRead?.verseId ? getVerse(lastRead.verseId) : undefined;
  const hist = [...history].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
  const locale = prefs.uiLang === "te" ? "te-IN" : "en-IN";
  return (
    <Screen testID="activity-screen" back title={t("myActivity")} icon="chart-bar">
      <View style={s.grid}>
        {cards.map((c) => (
          <View key={c.id} style={s.stat}>
            <Icon name={c.icon as any} size={24} color={colors.gold} />
            <Txt testID={`stat-${c.id}`} v="heading" size={24} color={colors.maroon}>{String(c.v)}</Txt>
            <Txt size={13} numberOfLines={2}>{t(c.k)}</Txt>
          </View>
        ))}
      </View>
      <SectionTitle title={t("lastPosition")} />
      <Card testID="activity-last-position" onPress={lb ? () => router.push("/continue") : undefined}>
        {lb && lc ? (
          <>
            <Txt v="heading" size={18} color={colors.maroon}>{L(lb.title)}</Txt>
            <Txt size={14}>{L(lb.chapterLabel)} {lc.number}{lv ? ` · ${t("verse")} ${lv.ref}` : ""}</Txt>
          </>
        ) : <Txt color={colors.muted}>{t("noHistory")}</Txt>}
      </Card>
      <View style={{ height: spacing.md }} />
      <SectionTitle title={t("readingProgress")} />
      <Card>
        {progress.length ? progress.map((p) => (
          <View key={p.id} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Txt v="semi" color={colors.maroon}>{L(getBook(p.id)?.title)}</Txt>
              <Txt color={colors.gold}>{bookPercent(p.id)}%</Txt>
            </View>
            <ProgressBar value={bookPercent(p.id)} />
          </View>
        )) : <Txt color={colors.muted}>{t("noHistory")}</Txt>}
      </Card>
      <View style={{ height: spacing.md }} />
      <SectionTitle title={t("history")} />
      {hist.length === 0 ? <EmptyState icon="history" text={t("noHistory")} /> : hist.map((h) => {
        const b = getBook(h.bookId); const c = getChapter(h.chapterId);
        return (
          <Pressable key={h.id} testID={`history-${h.id}`} onPress={() => router.push(`/reader/${h.bookId}?chapter=${c?.number ?? 1}`)} style={s.hRow}>
            <Icon name="history" size={20} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Txt v="semi" color={colors.maroon} numberOfLines={1}>{L(b?.title)} · {L(b?.chapterLabel)} {c?.number}</Txt>
              <Txt size={12} color={colors.muted}>{new Date(h.at).toLocaleString(locale)}</Txt>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  stat: { width: "31.5%", backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, padding: spacing.sm, gap: 2, minHeight: 110 },
  hRow: { flexDirection: "row", gap: spacing.md, alignItems: "center", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: c.divider },
}));
