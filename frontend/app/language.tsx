import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Card, GoldButton, Icon, Txt } from "@/src/components/ui";
import { LANGUAGES, LangCode, TKey } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Language() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const { t, prefs, setPrefs } = useApp();
  const s = useStyles();
  const { colors } = useTheme();

  const Group = ({ k, field, icon }: { k: TKey; field: "uiLang" | "readLang" | "audioLang"; icon: string }) => (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={s.gHead}>
        <Icon name={icon as any} size={22} color={colors.gold} />
        <Txt v="heading" size={19} color={colors.maroon}>{t(k)}</Txt>
      </View>
      <View style={s.grid}>
        {LANGUAGES.map((l) => {
          const active = prefs[field] === l.code;
          return (
            <Pressable
              key={l.code}
              testID={`lang-${field}-${l.code}`}
              disabled={!l.enabled}
              onPress={() => setPrefs({ [field]: l.code as LangCode } as any)}
              style={[s.opt, active && s.optActive, !l.enabled && s.optDisabled]}
            >
              <Txt v="bold" size={17} color={active ? colors.ivory : colors.maroon} style={{ fontFamily: l.code === "te" ? "NotoTelugu" : ["sa", "hi", "mr"].includes(l.code) ? "NotoDeva" : undefined }}>{l.native}</Txt>
              <Txt size={12} color={active ? colors.goldLight : colors.muted}>{l.enabled ? l.name : `${l.name} · ${t("comingSoon")}`}</Txt>
              {active ? <Icon name="check-circle" size={18} color={colors.goldLight} style={s.check} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );

  return (
    <Screen testID="language-screen" title={t("selectLanguage")} icon="translate" back={!onboarding}>
      <Txt size={15} color={colors.muted} style={{ marginBottom: spacing.md }}>{t("chooseLangHint")}</Txt>
      <Group k="uiLanguage" field="uiLang" icon="cellphone-text" />
      <Group k="readingLanguage" field="readLang" icon="book-open-page-variant-outline" />
      <Group k="audioLanguage" field="audioLang" icon="headphones" />
      <GoldButton
        testID="language-continue-button"
        label={t("getStarted")}
        icon="arrow-right"
        onPress={() => {
          if (onboarding) { setPrefs({ onboarded: true }); router.replace("/(tabs)"); }
          else router.back();
        }}
      />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  gHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  opt: { width: "48%", minHeight: 64, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, backgroundColor: c.ivory, padding: spacing.md, justifyContent: "center" },
  optActive: { backgroundColor: c.maroon, borderColor: c.gold, borderWidth: 2 },
  optDisabled: { opacity: 0.45 },
  check: { position: "absolute", right: 8, top: 8 },
}));
