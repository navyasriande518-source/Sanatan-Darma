import React from "react";
import { View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Badge, Card, Txt } from "@/src/components/ui";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

const FONTS = [
  { family: "Crimson", name: "Crimson Text", script: "English / IAST", sample: "Śrīmad Bhagavad Gītā", size: "331 KB" },
  { family: "NotoTelugu", name: "Noto Serif Telugu", script: "తెలుగు", sample: "శ్రీమద్భగవద్గీత", size: "543 KB" },
  { family: "Ramabhadra", name: "Ramabhadra", script: "తెలుగు (headings)", sample: "సనాతన ధర్మం", size: "733 KB" },
  { family: "Gurajada", name: "Gurajada", script: "తెలుగు (traditional)", sample: "జ్ఞాన విజ్ఞాన యోగము", size: "443 KB" },
  { family: "NotoDeva", name: "Noto Serif Devanagari", script: "संस्कृतम्", sample: "श्रीमद्भगवद्गीता", size: "758 KB" },
];

export default function Fonts() {
  const { t } = useApp();
  const { colors } = useTheme();
  return (
    <Screen testID="fonts-screen" back title={t("offlineFonts")} icon="format-font">
      {FONTS.map((f) => (
        <Card key={f.family} testID={`font-${f.family}`} style={{ marginBottom: spacing.md, gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Txt v="bold" size={16} color={colors.maroon}>{f.name}</Txt>
            <Txt size={12} color={colors.muted}>{f.size}</Txt>
          </View>
          <Txt size={13} color={colors.muted}>{f.script}</Txt>
          <Txt style={{ fontFamily: f.family, fontSize: 22, color: colors.burgundy }}>{f.sample}</Txt>
          <Badge label={t("fontsInstalled")} tone="green" />
        </Card>
      ))}
    </Screen>
  );
}
