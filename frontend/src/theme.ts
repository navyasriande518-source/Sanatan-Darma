// Design tokens (from /app/design_guidelines.json + user brand palette).
// Light app theme; the reader has its own dark/parchment backgrounds (readerThemes).
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FFF9EB",
  onSurface: "#4B2415",
  surfaceSecondary: "#FFF2D5",
  onSurfaceSecondary: "#3D0808",
  surfaceTertiary: "#FDF5E6",
  onSurfaceTertiary: "#650D0D",
  surfaceInverse: "#3D0808",
  onSurfaceInverse: "#F5C65C",
  muted: "#8C6239",

  brand: "#650D0D",
  onBrand: "#FFF9EB",
  brandPrimary: "#D69A28",
  onBrandPrimary: "#3D0808",
  brandSecondary: "#F5C65C",
  onBrandSecondary: "#3D0808",
  brandTertiary: "#650D0D",
  onBrandTertiary: "#FFF9EB",

  success: "#2E4C31",
  onSuccess: "#FFF9EB",
  warning: "#D69A28",
  onWarning: "#3D0808",
  error: "#8B0000",
  onError: "#FFF9EB",
  info: "#4B2415",
  onInfo: "#FFF9EB",

  border: "#D69A28",
  borderStrong: "#F5C65C",
  divider: "#E6D5B8",

  // Extras
  maroon: "#650D0D",
  burgundy: "#3D0808",
  gold: "#D69A28",
  goldLight: "#F5C65C",
  parchment: "#FFF2D5",
  ivory: "#FFF9EB",
  brown: "#4B2415",
  highlight: "#FBE3A0",
  cardBorder: "#EBCB8B",
  overlay: "rgba(61,8,8,0.55)",
  tabActiveTop: "#9A5A1C",
  tabActiveBottom: "#5A1A0A",
  shadow: "#8A5A10",
};

export type ThemeColors = typeof light;

export const readerThemes = {
  parchment: { bg: "#FFF2D5", text: "#3D0808", sub: "#4B2415", num: "#650D0D", hl: "#FBE3A0", card: "#FFF9EB" },
  ivory: { bg: "#FFFDF6", text: "#2B1A10", sub: "#4B2415", num: "#650D0D", hl: "#FBE8B4", card: "#FFFFFF" },
  sepia: { bg: "#F1E0C0", text: "#3A2414", sub: "#5A3A22", num: "#650D0D", hl: "#E9C979", card: "#F7EAD0" },
  dark: { bg: "#1E0B07", text: "#F3E3C3", sub: "#D9C29A", num: "#F5C65C", hl: "#4A2A0E", card: "#2A120C" },
};
export type ReaderBg = keyof typeof readerThemes;

export const defaultScheme = "light" satisfies ColorScheme;
export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}
setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = (system === "light" || system === "dark") && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export const colors = light;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };
export const radius = { sm: 4, md: 8, lg: 16, pill: 999 };

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
