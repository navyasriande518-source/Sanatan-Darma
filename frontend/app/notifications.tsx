import React from "react";

import { Screen } from "@/src/components/Screen";
import { Card, ToggleRow, Txt } from "@/src/components/ui";
import { useApp } from "@/src/store/AppContext";
import { spacing, useTheme } from "@/src/theme";

export default function Notifications() {
  const { t, prefs, setPrefs } = useApp();
  const { colors } = useTheme();
  const set = (k: keyof typeof prefs.notif, v: boolean) => setPrefs({ notif: { ...prefs.notif, [k]: v } });
  return (
    <Screen testID="notifications-screen" back title={t("notifications")} icon="bell-outline">
      <Card style={{ padding: 0 }}>
        <ToggleRow testID="notif-daily-switch" icon="white-balance-sunny" title={t("notifDaily")} value={prefs.notif.daily} onChange={(v) => set("daily", v)} />
        <ToggleRow testID="notif-books-switch" icon="book-plus-outline" title={t("notifBooks")} value={prefs.notif.books} onChange={(v) => set("books", v)} />
        <ToggleRow testID="notif-reading-switch" icon="alarm" title={t("notifReading")} value={prefs.notif.reading} onChange={(v) => set("reading", v)} />
        <ToggleRow testID="notif-updates-switch" icon="update" title={t("notifUpdates")} value={prefs.notif.updates} onChange={(v) => set("updates", v)} last />
      </Card>
      <Txt size={14} color={colors.muted} style={{ marginTop: spacing.md }}>{t("notifNote")}</Txt>
    </Screen>
  );
}
