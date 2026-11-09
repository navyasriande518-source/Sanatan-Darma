import { router } from "expo-router";
import React from "react";

import { Screen } from "@/src/components/Screen";
import { Card, Txt } from "@/src/components/ui";
import { MANTRAS, getBook, getVerse } from "@/src/data/content";
import { toTelugu } from "@/src/lib/translit";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

export default function Mantras() {
  const { t, L, prefs } = useApp();
  const { colors } = useTheme();
  const te = prefs.readLang === "te";
  return (
    <Screen testID="mantras-screen" back title={t("dailyMantras")} icon="spa-outline">
      {MANTRAS.map((m) => {
        const v = getVerse(m.verseId)!;
        return (
          <Card key={m.id} testID={`mantra-${m.id}`} onPress={() => router.push(`/verse/${v.id}`)} style={{ marginBottom: spacing.md, gap: 6 }}>
            <Txt v="heading" size={19} color={colors.maroon}>{L(m.title)}</Txt>
            <Txt size={13} color={colors.muted}>{L(getBook(v.bookId)?.title)} · {v.ref}</Txt>
            <Txt style={{ fontFamily: te ? "NotoTelugu" : "NotoDeva", fontSize: 18, lineHeight: 30, color: colors.burgundy }}>{te ? toTelugu(v.sa) : v.sa}</Txt>
            <Txt size={15}>{te ? v.te ?? v.en : v.en}</Txt>
          </Card>
        );
      })}
    </Screen>
  );
}
