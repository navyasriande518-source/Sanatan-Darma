import React from "react";

import { ReaderSettingsBody } from "@/src/components/ReaderSettings";
import { Screen } from "@/src/components/Screen";
import { Card } from "@/src/components/ui";
import { useApp } from "@/src/store/AppContext";

export default function ReadingPrefs() {
  const { t } = useApp();
  return (
    <Screen testID="reading-prefs-screen" back title={t("otherSettings")} icon="format-size">
      <Card><ReaderSettingsBody /></Card>
    </Screen>
  );
}
