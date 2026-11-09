import { router } from "expo-router";
import React from "react";
import { Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LANGUAGES } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Sheet } from "./Sheet";
import { Icon, Txt } from "./ui";

export function Toast() {
  const { toastMsg } = useApp();
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();
  if (!toastMsg) return null;
  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} pointerEvents="none" style={[s.toast, { bottom: insets.bottom + 90 }]}>
      <Icon name="check-circle-outline" size={20} color={colors.goldLight} />
      <Txt testID="toast-message" v="semi" size={15} color={colors.ivory}>{toastMsg}</Txt>
    </Animated.View>
  );
}

// Quick interface-language switcher (top-right selector).
export function LanguageSheet() {
  const { langSheet, setLangSheet, prefs, setPrefs, t } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Sheet testID="language-sheet" visible={langSheet} onClose={() => setLangSheet(false)} title={t("uiLanguage")}>
      {LANGUAGES.filter((l) => l.enabled).map((l) => (
        <Pressable key={l.code} testID={`quick-lang-${l.code}`} onPress={() => { setPrefs({ uiLang: l.code }); setLangSheet(false); }} style={[s.opt, prefs.uiLang === l.code && s.optActive]}>
          <Txt v="bold" size={18} color={colors.maroon} style={{ flex: 1 }}>{l.native}</Txt>
          <Txt size={14} color={colors.muted}>{l.name}</Txt>
          {prefs.uiLang === l.code ? <Icon name="check-circle" size={22} color={colors.gold} /> : null}
        </Pressable>
      ))}
      <Pressable testID="quick-lang-more" onPress={() => { setLangSheet(false); router.push("/language"); }} style={s.more}>
        <Icon name="translate" size={20} color={colors.maroon} />
        <Txt v="semi" size={15} color={colors.maroon}>{t("readingLanguage")} · {t("audioLanguage")}</Txt>
      </Pressable>
    </Sheet>
  );
}

const useStyles = makeStyles((c) => ({
  toast: {
    position: "absolute", alignSelf: "center", flexDirection: "row", gap: spacing.sm, alignItems: "center",
    backgroundColor: c.burgundy, borderColor: c.gold, borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  opt: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, marginBottom: spacing.sm, backgroundColor: c.ivory },
  optActive: { borderColor: c.gold, backgroundColor: c.parchment, borderWidth: 2 },
  more: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, justifyContent: "center" },
}));
