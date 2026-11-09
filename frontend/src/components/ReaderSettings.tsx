import React from "react";
import { Pressable, View } from "react-native";

import { useApp } from "@/src/store/AppContext";
import { ReaderBg, makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Sheet } from "./Sheet";
import { Txt } from "./ui";
import { Switch } from "react-native";

export function ReaderSettingsBody() {
  const { prefs, setPrefs, t } = useApp();
  const s = useStyles();
  const { colors } = useTheme();
  const Toggle = ({ k, label, testID }: { k: "readerDark" | "autoScroll" | "keepAwake" | "showOriginal" | "showTranslit" | "showTranslation" | "showNotes" | "showAudioBar"; label: string; testID: string }) => (
    <View style={s.tRow}>
      <Txt size={16} style={{ flex: 1 }}>{label}</Txt>
      <Switch testID={testID} value={prefs[k]} onValueChange={(v) => setPrefs({ [k]: v } as any)} trackColor={{ true: colors.success, false: colors.divider }} thumbColor={colors.ivory} />
    </View>
  );
  const Seg = <T extends string | number>({ label, options, value, onPick, id }: { label: string; options: { v: T; l: string }[]; value: T; onPick: (v: T) => void; id: string }) => (
    <View style={{ marginBottom: spacing.md }}>
      <Txt v="bold" size={15} color={colors.maroon} style={{ marginBottom: 6 }}>{label}</Txt>
      <View style={s.seg}>
        {options.map((o) => (
          <Pressable key={String(o.v)} testID={`${id}-${o.v}`} onPress={() => onPick(o.v)} style={[s.segItem, value === o.v && s.segActive]}>
            <Txt v="semi" size={14} color={value === o.v ? colors.ivory : colors.maroon}>{o.l}</Txt>
          </Pressable>
        ))}
      </View>
    </View>
  );
  return (
    <View>
      <View style={{ marginBottom: spacing.md }}>
        <Txt v="bold" size={15} color={colors.maroon} style={{ marginBottom: 6 }}>{t("fontSize")}</Txt>
        <View style={s.sizeRow}>
          <Pressable testID="font-decrease" onPress={() => setPrefs({ fontSize: Math.max(14, prefs.fontSize - 1) })} style={s.sizeBtn}><Txt v="bold" size={16} color={colors.maroon}>A−</Txt></Pressable>
          <Txt testID="font-size-value" v="bold" size={18} color={colors.maroon}>{prefs.fontSize}</Txt>
          <Pressable testID="font-increase" onPress={() => setPrefs({ fontSize: Math.min(32, prefs.fontSize + 1) })} style={s.sizeBtn}><Txt v="bold" size={20} color={colors.maroon}>A+</Txt></Pressable>
        </View>
      </View>
      <Seg id="font-family" label={t("fontFamily")} value={prefs.fontFamily} onPick={(v) => setPrefs({ fontFamily: v })} options={[{ v: "classic", l: "Classic Serif" }, { v: "traditional", l: "Traditional" }, { v: "system", l: "System" }]} />
      <Seg id="line-spacing" label={t("lineSpacing")} value={prefs.lineSpacing} onPick={(v) => setPrefs({ lineSpacing: v })} options={[{ v: 1.3, l: "1.3" }, { v: 1.6, l: "1.6" }, { v: 1.9, l: "1.9" }, { v: 2.2, l: "2.2" }]} />
      <Seg id="reader-bg" label={t("background")} value={prefs.readerBg} onPick={(v) => setPrefs({ readerBg: v as ReaderBg, readerDark: false })} options={(["parchment", "ivory", "sepia"] as const).map((k) => ({ v: k, l: k[0].toUpperCase() + k.slice(1) }))} />
      <Toggle k="readerDark" label={t("darkMode")} testID="toggle-dark" />
      <Toggle k="autoScroll" label={t("autoScroll")} testID="toggle-autoscroll" />
      <Toggle k="keepAwake" label={t("keepAwake")} testID="toggle-keepawake" />
      <Toggle k="showAudioBar" label={t("audioBar")} testID="toggle-audiobar-reader" />
      <Toggle k="showOriginal" label={t("showOriginal")} testID="toggle-original" />
      <Toggle k="showTranslit" label={t("showTranslit")} testID="toggle-translit" />
      <Toggle k="showTranslation" label={t("showTranslation")} testID="toggle-translation" />
      <Toggle k="showNotes" label={t("showNotes")} testID="toggle-notes" />
    </View>
  );
}

export function ReaderSettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useApp();
  return (
    <Sheet testID="reader-settings-sheet" visible={visible} onClose={onClose} title={t("readingSettings")}>
      <ReaderSettingsBody />
    </Sheet>
  );
}

const useStyles = makeStyles((c) => ({
  tRow: { flexDirection: "row", alignItems: "center", minHeight: 48, borderBottomWidth: 1, borderBottomColor: c.divider },
  seg: { flexDirection: "row", gap: 6 },
  segItem: { flex: 1, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: c.cardBorder, alignItems: "center", justifyContent: "center", backgroundColor: c.ivory },
  segActive: { backgroundColor: c.maroon, borderColor: c.gold },
  sizeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sizeBtn: { width: 64, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: c.gold, alignItems: "center", justifyContent: "center", backgroundColor: c.parchment },
}));
