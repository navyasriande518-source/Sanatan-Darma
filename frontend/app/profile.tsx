import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { Card, GoldButton, Row, Txt } from "@/src/components/ui";
import { langLabel } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function Profile() {
  const { t, profile, saveProfile, toast, prefs } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const [f, setF] = useState({ name: profile?.name ?? "", email: profile?.email ?? "", city: profile?.city ?? "", bio: profile?.bio ?? "" });
  const field = (k: keyof typeof f, label: string, opts: object = {}) => (
    <View style={{ marginBottom: spacing.md }}>
      <Txt v="bold" size={15} color={colors.maroon} style={{ marginBottom: 4 }}>{label}</Txt>
      <TextInput testID={`profile-${k}-input`} value={f[k]} onChangeText={(v) => setF({ ...f, [k]: v })} placeholderTextColor={colors.muted} style={[s.input, k === "bio" && { minHeight: 90, textAlignVertical: "top" }]} {...opts} />
    </View>
  );
  return (
    <Screen testID="profile-screen" back title={t("myProfile")} icon="account-circle-outline" keyboard>
      <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
        <Image source={require("../assets/images/art/avatar.jpg")} style={s.avatar} />
      </View>
      {field("name", t("name"), { autoCapitalize: "words" })}
      {field("email", t("email"), { keyboardType: "email-address", autoCapitalize: "none" })}
      {field("city", t("city"))}
      {field("bio", t("bio"), { multiline: true })}
      <GoldButton testID="profile-save-button" label={t("save")} icon="content-save-outline" onPress={async () => { await saveProfile(f); toast(t("profileSaved")); }} />
      <Card style={{ padding: 0, marginTop: spacing.lg }}>
        <Row testID="profile-language-prefs" icon="translate" title={t("language")} desc={`${t("uiLanguage")}: ${langLabel(prefs.uiLang)} · ${t("readingLanguage")}: ${langLabel(prefs.readLang)} · ${t("audioLanguage")}: ${langLabel(prefs.audioLang)}`} onPress={() => router.push("/language")} last />
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles((c) => ({
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: c.gold },
  input: { minHeight: 48, borderWidth: 1, borderColor: c.cardBorder, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 16, color: c.onSurface, backgroundColor: c.ivory, fontFamily: "Crimson" },
}));
