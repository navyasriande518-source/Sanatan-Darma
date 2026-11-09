import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Confirm } from "@/src/components/Sheet";
import { Card, GoldButton, Icon, Row, ToggleRow, Txt } from "@/src/components/ui";
import { langLabel } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Settings() {
  const params = useLocalSearchParams<{ logout?: string }>();
  const { t, prefs, setPrefs, setLangSheet, logout, profile } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (params.logout) { setConfirm(true); router.setParams({ logout: undefined }); } }, [params.logout]);

  const Boxed = ({ icon, title, desc, to, testID }: { icon: string; title: string; desc: string; to: string; testID: string }) => (
    <Card testID={testID} onPress={() => router.push(to as any)} style={s.boxCard}>
      <View style={s.iconBox}><Icon name={icon as any} size={24} color={colors.goldLight} /></View>
      <View style={{ flex: 1 }}>
        <Txt v="heading" size={18} color={colors.maroon}>{title}</Txt>
        <Txt size={13} numberOfLines={2}>{desc}</Txt>
      </View>
      <Icon name="chevron-right" size={24} color={colors.maroon} />
    </Card>
  );

  return (
    <Screen testID="settings-screen" title={t("settings")} icon="cog-outline" tab>
      <Card testID="settings-profile" onPress={() => router.push("/profile")} style={s.profile}>
        <Image source={require("../../assets/images/art/avatar.jpg")} style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Txt v="heading" size={22} color={colors.maroon}>{profile?.name || t("myProfile")}</Txt>
          <Txt size={13}>{t("myProfileDesc")}</Txt>
        </View>
        <Icon name="chevron-right" size={24} color={colors.maroon} />
      </Card>
      <Boxed testID="settings-activity" icon="chart-bar" title={t("myActivity")} desc={t("myActivityDesc")} to="/activity" />
      <Boxed testID="settings-notifications" icon="bell-outline" title={t("notifications")} desc={t("notificationsDesc")} to="/notifications" />
      <Boxed testID="settings-dana" icon="hand-heart" title={t("dana")} desc={t("danaDesc")} to="/dana" />

      <View style={s.pillRow}>
        <View style={s.line} />
        <View style={s.pill}><Txt v="heading" size={18} color={colors.maroon}>{t("generalSettings")}</Txt></View>
        <View style={s.line} />
      </View>

      <Card style={{ padding: 0 }}>
        <Row testID="settings-language" icon="web" title={t("language")} desc={t("languageDesc")} onPress={() => router.push("/language")}
          right={<Pressable testID="settings-language-pill" onPress={() => setLangSheet(true)} style={s.langPill}><Txt v="bold" size={14} color={colors.maroon}>{langLabel(prefs.uiLang)}</Txt><Icon name="chevron-down" size={18} color={colors.maroon} /></Pressable>} />
        <Row testID="settings-downloads" icon="download-outline" title={t("downloads")} desc={t("downloadsDesc")} onPress={() => router.push("/downloads")} />
        <ToggleRow testID="settings-audio-bar-switch" icon="waveform" title={t("audioBar")} desc={t("audioBarDesc")} value={prefs.showAudioBar} onChange={(v) => setPrefs({ showAudioBar: v })} />
        <Row testID="settings-fonts" icon="format-font" title={t("offlineFonts")} desc={t("offlineFontsDesc")} onPress={() => router.push("/fonts")} />
        <Row testID="settings-reading-prefs" icon="cog-outline" title={t("otherSettings")} desc={t("otherSettingsDesc")} onPress={() => router.push("/reading-prefs")} last />
      </Card>

      <View style={{ height: spacing.md }} />
      <Card style={{ padding: 0 }}>
        <Row testID="settings-help" icon="lifebuoy" title={t("help")} onPress={() => router.push("/info/help")} />
        <Row testID="settings-faq" icon="frequently-asked-questions" title={t("faq")} onPress={() => router.push("/info/faq")} />
        <Row testID="settings-about" icon="information-outline" title={t("aboutApp")} desc={t("aboutAppDesc")} onPress={() => router.push("/info/about")} />
        <Row testID="settings-privacy" icon="shield-lock-outline" title={t("privacy")} onPress={() => router.push("/info/privacy")} />
        <Row testID="settings-terms" icon="file-document-outline" title={t("terms")} onPress={() => router.push("/info/terms")} last />
      </Card>

      <GoldButton testID="settings-logout-button" label={t("logout")} icon="logout" onPress={() => setConfirm(true)} style={{ alignSelf: "center", minWidth: 220, marginTop: spacing.xl }} />

      <Confirm visible={confirm} title={t("logout")} message={t("logoutConfirm")} confirmLabel={t("logout")} cancelLabel={t("cancel")} onCancel={() => setConfirm(false)}
        onConfirm={async () => { setConfirm(false); await logout(); router.replace("/language?onboarding=1"); }} />
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  profile: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: c.gold },
  boxCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.sm },
  iconBox: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: c.maroon, alignItems: "center", justifyContent: "center" },
  pillRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginVertical: spacing.md },
  line: { flex: 1, height: 1.5, backgroundColor: c.gold },
  pill: { backgroundColor: c.highlight, borderRadius: radius.pill, borderWidth: 1, borderColor: c.gold, paddingHorizontal: spacing.lg, paddingVertical: 4 },
  langPill: { flexDirection: "row", alignItems: "center", gap: 2, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.pill, paddingHorizontal: 12, height: 36, backgroundColor: c.parchment },
}));
