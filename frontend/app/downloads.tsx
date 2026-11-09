import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Card, EmptyState, Icon, ProgressBar, SectionTitle, Txt, fmtBytes } from "@/src/components/ui";
import { AUDIO_TRACKS, getBook, getChapter } from "@/src/data/content";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, spacing, useTheme } from "@/src/theme";

export default function Downloads() {
  const { t, L, downloads, toggleDownload, toast } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const books = downloads.filter((d) => d.kind === "book");
  const audio = downloads.filter((d) => d.kind === "audio");
  const total = downloads.reduce((n, d) => n + d.bytes, 0);
  const remove = (id: string, kind: "book" | "audio", bytes: number) => { toggleDownload(id, kind, bytes); toast(t("delete")); };
  return (
    <Screen testID="downloads-screen" back title={t("downloads")} icon="download-outline">
      <Card testID="downloads-storage">
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Txt v="bold" color={colors.maroon}>{t("storageUsed")}</Txt>
          <Txt testID="downloads-storage-value" v="bold" color={colors.gold}>{fmtBytes(total)}</Txt>
        </View>
        <ProgressBar value={Math.min(100, (total / 10e6) * 100)} />
        <Txt size={13} color={colors.muted} style={{ marginTop: 6 }}>{t("bundledNote")}</Txt>
      </Card>
      <View style={{ height: spacing.md }} />
      <SectionTitle title={`${t("downloadedBooks")} (${books.length})`} />
      {books.length === 0 ? <EmptyState testID="downloads-empty" icon="download-off-outline" text={t("noDownloads")} /> : books.map((d) => {
        const b = getBook(d.id);
        return (
          <View key={d.id} style={s.row}>
            <Pressable testID={`download-open-${d.id}`} onPress={() => router.push(`/book/${d.id}`)} style={{ flex: 1 }}>
              <Txt v="semi" size={16} color={colors.maroon}>{L(b?.title)}</Txt>
              <Txt size={12} color={colors.muted}>{fmtBytes(d.bytes)}</Txt>
            </Pressable>
            <Pressable testID={`download-delete-${d.id}`} onPress={() => remove(d.id, "book", d.bytes)} hitSlop={8}><Icon name="delete-outline" size={24} color={colors.maroon} /></Pressable>
          </View>
        );
      })}
      <View style={{ height: spacing.md }} />
      <SectionTitle title={`${t("downloadedAudio")} (${audio.length})`} />
      {audio.map((d) => {
        const tr = AUDIO_TRACKS.find((a) => a.id === d.id);
        const c = tr ? getChapter(tr.chapterId) : undefined;
        return (
          <View key={d.id} style={s.row}>
            <Icon name="headphones" size={22} color={colors.gold} />
            <View style={{ flex: 1 }}>
              <Txt v="semi" size={16} color={colors.maroon}>{L(getBook(tr?.bookId ?? "")?.title)} · {c?.number} ({tr?.lang === "te" ? "తెలుగు" : "English"})</Txt>
              <Txt size={12} color={colors.muted}>{fmtBytes(d.bytes)} · {t("demoAudio")}</Txt>
            </View>
            <Pressable testID={`download-delete-${d.id}`} onPress={() => remove(d.id, "audio", d.bytes)} hitSlop={8}><Icon name="delete-outline" size={24} color={colors.maroon} /></Pressable>
          </View>
        );
      })}
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: c.divider },
}));
