import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { BookCard } from "@/src/components/BookCards";
import { Screen } from "@/src/components/Screen";
import { Card, GoldButton, Icon, LotusDivider, ProgressBar, SectionTitle, Txt } from "@/src/components/ui";
import { BOOKS, MANTRAS, dailyVerse, getBook, getChapter, getVerse } from "@/src/data/content";
import { toTelugu } from "@/src/lib/translit";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Home() {
  const { t, L, prefs, profile, lastRead, recentBooks, bookPercent, progress } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const dv = dailyVerse();
  const dvBook = getBook(dv.bookId)!;
  const te = prefs.readLang === "te";
  const lastBook = lastRead ? getBook(lastRead.id) : undefined;
  const lastCh = lastRead ? getChapter(lastRead.chapterId) : undefined;
  const lastV = lastRead?.verseId ? getVerse(lastRead.verseId) : undefined;
  const featured = BOOKS.filter((b) => ["bhagavad-gita", "ramayana", "upanishads", "rig-veda"].includes(b.id));
  const popular = [...BOOKS].sort((a, b) => b.popular - a.popular).slice(0, 6);
  const added = [...BOOKS].sort((a, b) => b.addedOrder - a.addedOrder).slice(0, 6);
  const recommended = BOOKS.filter((b) => ["yoga-sutras", "narada-bhakti", "brahma-sutras"].includes(b.id));
  const inProgress = progress.map((p) => ({ b: getBook(p.id)!, pct: bookPercent(p.id) })).filter((x) => x.b);

  const Shelf = ({ title, books, id }: { title: string; books: typeof BOOKS; id: string }) => (
    <View style={{ marginBottom: spacing.lg }}>
      <SectionTitle title={title} action={t("seeAll")} onAction={() => router.push("/(tabs)/books")} testID={`home-${id}-see-all`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.lg, paddingBottom: 6 }}>
        {books.map((b) => <BookCard key={b.id} book={b} horizontal />)}
      </ScrollView>
    </View>
  );

  return (
    <Screen testID="home-screen" title={t("home")} icon="home" tab>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Txt testID="home-welcome" v="heading" size={24} color={colors.maroon}>{t("welcome", { name: profile?.name || (prefs.uiLang === "te" ? "భక్తులు" : "Seeker") })}</Txt>
        <Txt size={15} color={colors.muted} style={{ marginBottom: spacing.md }}>{t("welcomeSub")}</Txt>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <Card testID="home-daily-shloka" onPress={() => router.push(`/verse/${dv.id}`)} style={s.daily}>
          <View style={s.dailyHead}>
            <Icon name="white-balance-sunny" size={22} color={colors.gold} />
            <Txt v="bold" size={17} color={colors.goldLight} style={{ flex: 1 }}>{t("dailyShloka")}</Txt>
            <Txt size={13} color={colors.parchment}>{L(dvBook.title)} {dv.ref}</Txt>
          </View>
          <Txt style={{ fontFamily: te ? "NotoTelugu" : "NotoDeva", fontSize: 17, lineHeight: 28, color: colors.ivory }}>{te ? toTelugu(dv.sa) : dv.sa}</Txt>
          <Txt size={15} color={colors.parchment} style={{ marginTop: spacing.sm, fontFamily: te ? "NotoTelugu" : "Crimson" }} numberOfLines={3}>{te ? dv.te ?? dv.en : dv.en}</Txt>
          <Txt v="bold" size={14} color={colors.goldLight} style={{ marginTop: spacing.sm }}>{t("readFull")} →</Txt>
        </Card>
      </Animated.View>

      <LotusDivider />
      <SectionTitle title={t("continueReading")} />
      {lastBook && lastCh ? (
        <Card testID="home-continue-reading" onPress={() => router.push(`/reader/${lastBook.id}?chapter=${lastCh.number}${lastV ? `&verse=${lastV.n}` : ""}`)} style={s.cont}>
          <Image source={lastBook.cover} style={s.contImg} contentFit="cover" />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt v="heading" size={18} color={colors.maroon} numberOfLines={1}>{L(lastBook.title)}</Txt>
            <Txt size={14} numberOfLines={1}>{L(lastBook.chapterLabel)} {lastCh.number}{lastV ? ` · ${t("verse")} ${lastV.ref}` : ""}</Txt>
            <ProgressBar value={bookPercent(lastBook.id)} />
            <Txt size={13} color={colors.gold}>{t("percentRead", { n: bookPercent(lastBook.id) })}</Txt>
          </View>
          <Icon name="play-circle" size={40} color={colors.maroon} />
        </Card>
      ) : (
        <Card testID="home-continue-empty">
          <Txt size={15} color={colors.muted} style={{ marginBottom: spacing.md }}>{t("noContinue")}</Txt>
          <GoldButton testID="home-start-gita" label={`${t("startReading")} – ${L(getBook("bhagavad-gita")!.title)}`} icon="book-open-variant" onPress={() => router.push("/reader/bhagavad-gita?chapter=7")} />
        </Card>
      )}

      {recentBooks.length ? <View style={{ marginTop: spacing.lg }}><Shelf id="recent" title={t("recentlyOpened")} books={recentBooks.slice(0, 6)} /></View> : <View style={{ height: spacing.lg }} />}
      <Shelf id="featured" title={t("featured")} books={featured} />
      <Shelf id="popular" title={t("popular")} books={popular} />
      <Shelf id="added" title={t("recentlyAdded")} books={added} />

      <SectionTitle title={t("recommended")} />
      {recommended.map((b) => <BookCard key={b.id} book={b} />)}

      <LotusDivider />
      <SectionTitle title={t("dailyMantras")} action={t("seeAll")} onAction={() => router.push("/mantras")} testID="home-mantras-see-all" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingBottom: 6 }}>
        {MANTRAS.map((m) => {
          const v = getVerse(m.verseId)!;
          return (
            <Card key={m.id} testID={`home-mantra-${m.id}`} onPress={() => router.push(`/verse/${v.id}`)} style={s.mantra}>
              <Icon name="spa-outline" size={22} color={colors.gold} />
              <Txt v="bold" size={15} color={colors.maroon} numberOfLines={1}>{L(m.title)}</Txt>
              <Txt size={14} numberOfLines={2} style={{ fontFamily: te ? "NotoTelugu" : "NotoDeva" }}>{te ? toTelugu(v.sa) : v.sa}</Txt>
            </Card>
          );
        })}
      </ScrollView>

      <View style={{ height: spacing.lg }} />
      <SectionTitle title={t("learning")} />
      <View style={s.learnRow}>
        {[
          { k: "chanting" as const, icon: "music-note-outline", to: "/mantras" },
          { k: "puja" as const, icon: "candle", to: "/coming-soon?key=puja" },
          { k: "festivals" as const, icon: "calendar-star", to: "/coming-soon?key=festivals" },
          { k: "quiz" as const, icon: "head-question-outline", to: "/coming-soon?key=quiz" },
        ].map((x) => (
          <Pressable key={x.k} testID={`home-learn-${x.k}`} onPress={() => router.push(x.to as any)} style={s.learn}>
            <Icon name={x.icon as any} size={26} color={colors.maroon} />
            <Txt v="semi" size={13} color={colors.maroon} numberOfLines={2} style={{ textAlign: "center" }}>{t(x.k)}</Txt>
          </Pressable>
        ))}
      </View>

      <View style={{ height: spacing.lg }} />
      <SectionTitle title={t("readingProgress")} action={t("myActivity")} onAction={() => router.push("/activity")} testID="home-activity-link" />
      <Card testID="home-reading-progress">
        {inProgress.length ? inProgress.map(({ b, pct }) => (
          <Pressable key={b.id} onPress={() => router.push(`/book/${b.id}`)} style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Txt v="semi" size={15} color={colors.maroon}>{L(b.title)}</Txt>
              <Txt size={14} color={colors.gold}>{pct}%</Txt>
            </View>
            <ProgressBar value={pct} />
          </Pressable>
        )) : <Txt size={15} color={colors.muted}>{t("noContinue")}</Txt>}
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  daily: { backgroundColor: c.maroon, borderColor: c.gold, borderWidth: 2 },
  dailyHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  cont: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  contImg: { width: 70, height: 84, borderRadius: radius.md, borderWidth: 1, borderColor: c.gold },
  mantra: { width: 210, gap: 4 },
  learnRow: { flexDirection: "row", gap: spacing.sm },
  learn: { flex: 1, alignItems: "center", gap: 6, padding: spacing.sm, minHeight: 90, justifyContent: "center", backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder },
}));
