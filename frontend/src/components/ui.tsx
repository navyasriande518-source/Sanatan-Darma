import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleProp, Switch, Text, TextProps, TextStyle, View, ViewStyle } from "react-native";

import { useApp } from "@/src/store/AppContext";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export const Icon = MaterialDesignIcons;

export const FONTS = {
  en: { body: "Crimson", semi: "CrimsonSemi", bold: "CrimsonBold", heading: "CrimsonBold" },
  te: { body: "NotoTelugu", semi: "NotoTelugu", bold: "NotoTelugu", heading: "Ramabhadra" },
  sa: "NotoDeva",
};

export function useFonts() {
  const { prefs } = useApp();
  return prefs.uiLang === "te" ? FONTS.te : FONTS.en;
}

type TxtProps = TextProps & { v?: "body" | "semi" | "bold" | "heading"; size?: number; color?: string; style?: StyleProp<TextStyle> };
export function Txt({ v = "body", size = 15, color, style, ...rest }: TxtProps) {
  const f = useFonts();
  const { colors } = useTheme();
  const te = f === FONTS.te;
  return (
    <Text
      {...rest}
      style={[{ fontFamily: f[v], fontSize: te ? size * 0.9 : size, color: color ?? colors.onSurface, fontWeight: te && (v === "bold" || v === "semi") ? "700" : undefined }, style]}
    />
  );
}

export function Card({ children, style, onPress, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string }) {
  const s = useStyles();
  if (!onPress) return <View testID={testID} style={[s.card, style]}>{children}</View>;
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}>
      {children}
    </Pressable>
  );
}

export function Chip({ label, active, onPress, icon, testID }: { label: string; active?: boolean; onPress: () => void; icon?: string; testID?: string }) {
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} style={[s.chip, active && s.chipActive]}>
      {icon ? <Icon name={icon as any} size={16} color={active ? colors.goldLight : colors.maroon} /> : null}
      <Txt v="semi" size={15} color={active ? colors.ivory : colors.maroon} numberOfLines={1}>{label}</Txt>
    </Pressable>
  );
}

export function LotusDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[s.divRow, style]}>
      <View style={s.divLine} />
      <Icon name="spa-outline" size={22} color={colors.gold} />
      <View style={s.divLine} />
    </View>
  );
}

export function SectionTitle({ title, action, onAction, testID }: { title: string; action?: string; onAction?: () => void; testID?: string }) {
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <View style={s.secRow}>
      <View style={s.secLeft}>
        <Icon name="spa-outline" size={18} color={colors.gold} />
        <Txt v="heading" size={21} color={colors.maroon} numberOfLines={1} style={{ flexShrink: 1 }}>{title}</Txt>
      </View>
      {action ? (
        <Pressable testID={testID} onPress={onAction} hitSlop={10}>
          <Txt v="semi" size={14} color={colors.gold}>{action}</Txt>
        </Pressable>
      ) : null}
    </View>
  );
}

export function GoldButton({ label, onPress, icon, variant = "maroon", testID, style }: { label: string; onPress: () => void; icon?: string; variant?: "maroon" | "cream"; testID?: string; style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  const { colors } = useTheme();
  const maroon = variant === "maroon";
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [s.btnWrap, style, pressed && { transform: [{ scale: 0.97 }] }]}>
      <LinearGradient colors={maroon ? [colors.maroon, colors.burgundy] : [colors.ivory, colors.parchment]} style={s.btn}>
        {icon ? <Icon name={icon as any} size={20} color={maroon ? colors.goldLight : colors.maroon} /> : null}
        <Txt v="bold" size={17} color={maroon ? colors.ivory : colors.maroon} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={{ flexShrink: 1 }}>{label}</Txt>
      </LinearGradient>
    </Pressable>
  );
}

export function ProgressBar({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  const s = useStyles();
  return (
    <View style={[s.pTrack, style]}>
      <View style={[s.pFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

export function Row({ icon, title, desc, onPress, right, testID, last }: { icon: string; title: string; desc?: string; onPress?: () => void; right?: React.ReactNode; testID?: string; last?: boolean }) {
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable testID={testID} onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.row, !last && s.rowBorder, pressed && { backgroundColor: colors.parchment }]}>
      <Icon name={icon as any} size={26} color={colors.maroon} style={{ width: 34 }} />
      <View style={{ flex: 1 }}>
        <Txt v="bold" size={17} color={colors.maroon}>{title}</Txt>
        {desc ? <Txt size={13} color={colors.onSurface}>{desc}</Txt> : null}
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={24} color={colors.maroon} /> : null)}
    </Pressable>
  );
}

export function ToggleRow({ icon, title, desc, value, onChange, testID, last }: { icon: string; title: string; desc?: string; value: boolean; onChange: (v: boolean) => void; testID?: string; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <Row icon={icon} title={title} desc={desc} last={last}
      right={<Switch testID={testID} value={value} onValueChange={onChange} trackColor={{ true: colors.success, false: colors.divider }} thumbColor={colors.ivory} />} />
  );
}

export function Badge({ label, tone = "gold" }: { label: string; tone?: "gold" | "maroon" | "green" }) {
  const { colors } = useTheme();
  const bg = tone === "gold" ? colors.highlight : tone === "maroon" ? colors.maroon : colors.success;
  const fg = tone === "gold" ? colors.burgundy : colors.ivory;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" }}>
      <Txt v="semi" size={12} color={fg}>{label}</Txt>
    </View>
  );
}

export function EmptyState({ icon, text, testID }: { icon: string; text: string; testID?: string }) {
  const { colors } = useTheme();
  return (
    <View testID={testID} style={{ alignItems: "center", padding: spacing.xl, gap: spacing.md }}>
      <Icon name={icon as any} size={48} color={colors.gold} />
      <Txt size={16} color={colors.muted} style={{ textAlign: "center" }}>{text}</Txt>
    </View>
  );
}

export const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export const fmtBytes = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.ivory, borderRadius: radius.lg, borderWidth: 1, borderColor: c.cardBorder, padding: spacing.lg,
    shadowColor: c.shadow, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  chip: {
    flexShrink: 0, height: 38, paddingHorizontal: 16, borderRadius: radius.lg, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: c.ivory, borderWidth: 1, borderColor: c.cardBorder,
  },
  chipActive: { backgroundColor: c.maroon, borderColor: c.gold },
  divRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginVertical: spacing.md },
  divLine: { flex: 1, height: 1, backgroundColor: c.gold, opacity: 0.6 },
  secRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md, marginTop: spacing.sm },
  secLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  btnWrap: { borderRadius: radius.pill, borderWidth: 2, borderColor: c.gold, overflow: "hidden" },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: 12, paddingHorizontal: spacing.xl, minHeight: 50 },
  pTrack: { height: 8, borderRadius: 4, backgroundColor: c.divider, overflow: "hidden" },
  pFill: { height: 8, borderRadius: 4, backgroundColor: c.gold },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, minHeight: 60 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: c.divider },
}));
