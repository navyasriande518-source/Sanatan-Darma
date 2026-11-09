import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Book, CATEGORIES } from "@/src/data/content";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Icon, Txt } from "./ui";

// Grid cover card (Books screen, 3 columns).
export function BookTile({ book, width }: { book: Book; width: number }) {
  const { L } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable testID={`book-tile-${book.id}`} onPress={() => router.push(`/book/${book.id}`)} style={({ pressed }) => [s.tile, { width }, pressed && { transform: [{ scale: 0.97 }] }]}>
      <Image source={book.cover} style={[s.tileImg, { height: width * 0.62 }]} contentFit="cover" />
      <View style={s.tileBody}>
        <Txt v="heading" size={15} color={colors.maroon} numberOfLines={2} style={{ textAlign: "center" }}>{L(book.title)}</Txt>
        <View style={s.meta}>
          <Icon name="book-open-page-variant-outline" size={13} color={colors.brown} />
          <Txt size={12} numberOfLines={1} style={{ flexShrink: 1 }}>{L(book.sections)}</Txt>
        </View>
      </View>
    </Pressable>
  );
}

// Horizontal list card used on Home & search results.
export function BookCard({ book, horizontal }: { book: Book; horizontal?: boolean }) {
  const { L, t, bookPercent } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const cat = CATEGORIES.find((c) => c.id === book.categoryId);
  const hasAudio = book.id === "bhagavad-gita";
  const pct = bookPercent(book.id);
  if (horizontal) {
    return (
      <Pressable testID={`book-card-${book.id}`} onPress={() => router.push(`/book/${book.id}`)} style={({ pressed }) => [s.hCard, pressed && { transform: [{ scale: 0.97 }] }]}>
        <Image source={book.cover} style={s.hImg} contentFit="cover" />
        <View style={{ padding: spacing.sm, gap: 2 }}>
          <Txt v="heading" size={15} color={colors.maroon} numberOfLines={1}>{L(book.title)}</Txt>
          <Txt size={12} color={colors.muted} numberOfLines={1}>{L(cat?.name)} · {L(book.sections)}</Txt>
          {pct > 0 ? <Txt size={12} color={colors.gold}>{t("percentRead", { n: pct })}</Txt> : null}
        </View>
      </Pressable>
    );
  }
  return (
    <Pressable testID={`book-row-${book.id}`} onPress={() => router.push(`/book/${book.id}`)} style={({ pressed }) => [s.row, pressed && { opacity: 0.85 }]}>
      <Image source={book.cover} style={s.rowImg} contentFit="cover" />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt v="heading" size={17} color={colors.maroon} numberOfLines={1}>{L(book.title)}</Txt>
        <Txt size={13} color={colors.muted} numberOfLines={1}>{L(cat?.name)} · {book.languages.map((l) => l.toUpperCase()).join(" · ")} · {L(book.sections)}</Txt>
        <Txt size={13} numberOfLines={2}>{L(book.description)}</Txt>
        <View style={s.tags}>
          <Txt size={12} color={book.edition === "demo" ? colors.success : colors.muted}>{book.edition === "demo" ? `● ${t("readable")}` : `○ ${t("catalogue")}`}</Txt>
          {hasAudio ? <Txt size={12} color={colors.gold}>♪ {t("audio")}</Txt> : null}
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  tile: { backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1.5, borderColor: c.cardBorder, overflow: "hidden", shadowColor: c.shadow, shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  tileImg: { width: "100%" },
  tileBody: { padding: 6, minHeight: 62, justifyContent: "center", gap: 2 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  hCard: { width: 150, backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, overflow: "hidden", elevation: 2, shadowColor: c.shadow, shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  hImg: { width: "100%", height: 90 },
  row: { flexDirection: "row", gap: spacing.md, padding: spacing.md, backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, marginBottom: spacing.md },
  rowImg: { width: 76, height: 96, borderRadius: radius.md, borderWidth: 1, borderColor: c.gold },
  tags: { flexDirection: "row", gap: spacing.md, marginTop: 2 },
}));
