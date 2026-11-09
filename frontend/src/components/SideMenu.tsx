import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TKey } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, spacing, useTheme } from "@/src/theme";
import { Icon, Txt } from "./ui";

type Item = { k: TKey; icon: string; to: string };
const cs = (k: TKey) => `/coming-soon?key=${k}`;
const SECTIONS: { k: TKey; items: Item[] }[] = [
  { k: "menuExplore", items: [
    { k: "home", icon: "home-outline", to: "/(tabs)" },
    { k: "allBooks", icon: "bookshelf", to: "/(tabs)/books" },
    { k: "categories", icon: "shape-outline", to: "/(tabs)/books?focus=categories" },
    { k: "authors", icon: "account-tie-outline", to: cs("authors") },
    { k: "newFeatured", icon: "star-outline", to: "/(tabs)/books?sort=new" },
    { k: "trending", icon: "trending-up", to: "/(tabs)/books?sort=popular" },
  ] },
  { k: "menuLibrary", items: [
    { k: "continueReading", icon: "book-open-variant", to: "/continue" },
    { k: "bookmarks", icon: "bookmark-outline", to: "/(tabs)/bookmarks" },
    { k: "myNotes", icon: "note-edit-outline", to: "/(tabs)/bookmarks?tab=notes" },
    { k: "downloads", icon: "download-outline", to: "/downloads" },
    { k: "history", icon: "history", to: "/activity" },
    { k: "myCollections", icon: "folder-outline", to: "/(tabs)/bookmarks?collections=1" },
  ] },
  { k: "menuLearning", items: [
    { k: "dailyVerse", icon: "white-balance-sunny", to: "/verse/daily" },
    { k: "chanting", icon: "music-note-outline", to: "/mantras" },
    { k: "stotras", icon: "hands-pray", to: "/(tabs)/books?cat=stotras" },
    { k: "puja", icon: "candle", to: cs("puja") },
    { k: "festivals", icon: "calendar-star", to: cs("festivals") },
    { k: "learning", icon: "school-outline", to: cs("learning") },
    { k: "quiz", icon: "head-question-outline", to: cs("quiz") },
  ] },
  { k: "menuCommunity", items: [
    { k: "activityProgress", icon: "chart-bar", to: "/activity" },
    { k: "satsang", icon: "account-group-outline", to: cs("satsang") },
    { k: "ask", icon: "comment-question-outline", to: cs("ask") },
    { k: "dana", icon: "hand-heart", to: "/dana" },
  ] },
  { k: "menuAccount", items: [
    { k: "myProfile", icon: "account-circle-outline", to: "/profile" },
    { k: "notifications", icon: "bell-outline", to: "/notifications" },
    { k: "generalSettings", icon: "cog-outline", to: "/(tabs)/settings" },
    { k: "language", icon: "translate", to: "/language" },
    { k: "help", icon: "lifebuoy", to: "/info/help" },
    { k: "aboutApp", icon: "information-outline", to: "/info/about" },
    { k: "logout", icon: "logout", to: "/(tabs)/settings?logout=1" },
  ] },
];

export function SideMenu() {
  const { menuOpen, setMenuOpen, t, profile } = useApp();
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();
  const go = (to: string) => {
    setMenuOpen(false);
    setTimeout(() => router.push(to as any), 50);
  };
  return (
    <Modal visible={menuOpen} transparent animationType="none" onRequestClose={() => setMenuOpen(false)} statusBarTranslucent>
      <View style={s.root}>
        <Animated.View entering={FadeIn} style={s.backdrop}>
          <Pressable testID="side-menu-backdrop" style={{ flex: 1 }} onPress={() => setMenuOpen(false)} />
        </Animated.View>
        <Animated.View entering={SlideInLeft.duration(260)} testID="side-menu" style={[s.panel, { paddingTop: insets.top + spacing.md }]}>
          <View style={s.top}>
            <Icon name="spa" size={34} color={colors.goldLight} />
            <View style={{ flex: 1 }}>
              <Txt v="heading" size={22} color={colors.goldLight}>{t("appName")}</Txt>
              <Txt size={14} color={colors.parchment}>{profile?.name ?? t("appSub")}</Txt>
            </View>
            <Pressable testID="side-menu-close" onPress={() => setMenuOpen(false)} hitSlop={10}>
              <Icon name="close" size={26} color={colors.goldLight} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
            {SECTIONS.map((sec) => (
              <View key={sec.k} style={s.sec}>
                <Txt v="bold" size={14} color={colors.gold} style={s.secT}>{t(sec.k).toUpperCase()}</Txt>
                {sec.items.map((it) => (
                  <Pressable key={it.k + it.to} testID={`menu-item-${it.k}`} onPress={() => go(it.to)} style={({ pressed }) => [s.item, pressed && { backgroundColor: colors.maroon }]}>
                    <Icon name={it.icon as any} size={21} color={colors.goldLight} />
                    <Txt size={16} color={colors.ivory}>{t(it.k)}</Txt>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, flexDirection: "row" },
  backdrop: { ...({ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as const), backgroundColor: c.overlay },
  panel: { width: "82%", maxWidth: 340, backgroundColor: c.burgundy, borderRightWidth: 2, borderRightColor: c.gold },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: c.gold },
  sec: { paddingTop: spacing.md },
  secT: { paddingHorizontal: spacing.lg, marginBottom: 4, letterSpacing: 1 },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44 },
}));
