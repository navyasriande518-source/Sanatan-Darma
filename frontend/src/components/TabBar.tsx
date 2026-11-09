type BottomTabBarProps = { state: { index: number; routes: { key: string; name: string }[] }; navigation?: any; navigateToTab?: (key: string) => void; emitter?: any };
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TKey } from "@/src/i18n";
import { useApp } from "@/src/store/AppContext";
import { makeStyles, useTheme } from "@/src/theme";
import { Icon, Txt } from "./ui";

const TABS: Record<string, { k: TKey; icon: string; active: string }> = {
  index: { k: "home", icon: "home-outline", active: "home" },
  books: { k: "books", icon: "book-open-page-variant-outline", active: "book-open-page-variant" },
  bookmarks: { k: "bookmarks", icon: "bookmark-outline", active: "bookmark" },
  settings: { k: "settings", icon: "cog-outline", active: "cog" },
};

// Maroon & gold tab bar matching the reference design.
export function TabBar({ state, navigation, navigateToTab, emitter }: BottomTabBarProps) {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const s = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((r: { key: string; name: string }, i: number) => {
        const cfg = TABS[r.name];
        if (!cfg) return null;
        const focused = state.index === i;
        const onPress = () => {
          const e = (emitter ?? navigation)?.emit?.({ type: "tabPress", target: r.key, canPreventDefault: true });
          if (focused || e?.defaultPrevented) return;
          if (navigateToTab) navigateToTab(r.key);
          else navigation?.navigate(r.name as never);
        };
        const content = (
          <>
            <Icon name={(focused ? cfg.active : cfg.icon) as any} size={26} color={focused ? colors.goldLight : colors.ivory} />
            <Txt v={focused ? "bold" : "semi"} size={14} color={focused ? colors.goldLight : colors.ivory} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{t(cfg.k)}</Txt>
          </>
        );
        return (
          <Pressable key={r.key} testID={`tab-${r.name}`} accessibilityRole="tab" accessibilityState={{ selected: focused }} onPress={onPress} style={s.item}>
            {focused ? (
              <LinearGradient colors={[colors.tabActiveTop, colors.tabActiveBottom]} style={s.pill}>{content}</LinearGradient>
            ) : (
              <View style={s.plain}>{content}</View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: {
    flexDirection: "row", backgroundColor: c.burgundy, borderTopWidth: 2, borderTopColor: c.gold, paddingTop: 8, paddingHorizontal: 6,
    ...(Platform.OS === "web" ? { minHeight: 72 } : {}),
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  pill: { alignItems: "center", justifyContent: "center", borderRadius: 16, borderWidth: 1.5, borderColor: c.gold, paddingVertical: 6, paddingHorizontal: 6, width: "94%", minHeight: 58 },
  plain: { alignItems: "center", justifyContent: "center", paddingVertical: 6, minHeight: 58 },
}));
