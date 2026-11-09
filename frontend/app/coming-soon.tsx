import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { GoldButton, Icon, LotusDivider, Txt } from "@/src/components/ui";
import { TKey } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

export default function ComingSoon() {
  const { key } = useLocalSearchParams<{ key?: string }>();
  const { t } = useApp();
  const { colors } = useTheme();
  const title = key ? t(key as TKey) : t("comingSoon");
  return (
    <Screen testID="coming-soon-screen" back title={title}>
      <View style={{ alignItems: "center", gap: spacing.md, paddingVertical: spacing.xxl }}>
        <Icon name="spa" size={72} color={colors.gold} />
        <Txt testID="coming-soon-title" v="heading" size={26} color={colors.maroon}>{t("comingSoon")}</Txt>
        <Txt size={16} style={{ textAlign: "center" }}>{t("comingSoonDesc")}</Txt>
        <LotusDivider style={{ width: "80%" }} />
        <GoldButton testID="coming-soon-back" label={t("goBack")} icon="arrow-left" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
      </View>
    </Screen>
  );
}
