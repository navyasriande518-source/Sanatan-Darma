import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { langLabel } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, spacing, useTheme } from "@/src/theme";
import { Icon, Txt } from "./ui";

const ART = { en: require("../../assets/images/art/header_en.jpg"), te: require("../../assets/images/art/header_te.jpg") };
const RATIO = 237 / 941;

// Devotional header (artwork from the reference design) + maroon/gold ribbon.
export function AppHeader({ title, icon, back, compact }: { title?: string; icon?: string; back?: boolean; compact?: boolean }) {
  const { prefs, setMenuOpen, setLangSheet } = useApp();
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[s.wrap, { paddingTop: insets.top }]}>
      <View style={compact ? s.artCompact : s.art}>
        <Image source={prefs.uiLang === "te" ? ART.te : ART.en} style={s.img} contentFit="cover" contentPosition="top" />
        <Pressable testID={back ? "header-back-button" : "header-menu-button"} onPress={() => (back ? (router.canGoBack() ? router.back() : router.replace("/")) : setMenuOpen(true))} style={s.leftBtn} hitSlop={6}>
          <Icon name={back ? "arrow-left" : "menu"} size={24} color={colors.burgundy} />
        </Pressable>
        <Pressable testID="header-language-selector" onPress={() => setLangSheet(true)} style={s.langBtn} hitSlop={6}>
          <Icon name="web" size={18} color={colors.burgundy} />
          <Txt v="bold" size={15} color={colors.burgundy}>{langLabel(prefs.uiLang)}</Txt>
          <Icon name="chevron-down" size={16} color={colors.burgundy} />
        </Pressable>
      </View>
      {title ? (
        <View style={s.ribbonOuter}>
          <View style={s.ribbon}>
            <Icon name="spa-outline" size={16} color={colors.goldLight} style={s.orn} />
            {icon ? <Icon name={icon as any} size={22} color={colors.goldLight} /> : null}
            <Txt testID="screen-title" v="heading" size={24} color={colors.goldLight} numberOfLines={1} style={{ flexShrink: 1 }}>{title}</Txt>
            <Icon name="spa-outline" size={16} color={colors.goldLight} style={s.orn} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: { backgroundColor: c.burgundy, borderBottomWidth: 2, borderBottomColor: c.gold, zIndex: 2, elevation: 6 },
  art: { width: "100%", aspectRatio: 1 / RATIO, maxHeight: 130, overflow: "hidden" },
  artCompact: { width: "100%", height: 64, overflow: "hidden" },
  img: { ...({ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 } as const) },
  leftBtn: {
    position: "absolute", left: 10, top: 8, width: 44, height: 40, borderRadius: 12, backgroundColor: c.parchment,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: c.cardBorder,
  },
  langBtn: {
    position: "absolute", right: 8, top: 8, height: 40, paddingHorizontal: 12, borderRadius: 20, backgroundColor: c.parchment,
    flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: c.cardBorder, minWidth: 96,
  },
  ribbonOuter: { alignItems: "center", marginBottom: -20, marginTop: -6, zIndex: 2 },
  ribbon: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: c.maroon, borderWidth: 2, borderColor: c.gold,
    borderRadius: 14, paddingHorizontal: spacing.xl, paddingVertical: 6, maxWidth: "88%",
    shadowColor: c.burgundy, shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5,
  },
  orn: { opacity: 0.9 },
}));
