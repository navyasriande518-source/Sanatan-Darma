import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "@/src/theme";
import { AppHeader } from "./AppHeader";

// Standard screen: sticky devotional header + scrolling parchment content.
export function Screen({ title, icon, back, children, sticky, testID, keyboard, tab }: { title?: string; icon?: string; back?: boolean; children: React.ReactNode; sticky?: React.ReactNode; testID?: string; keyboard?: boolean; tab?: boolean }) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);
  const pb = tab ? spacing.xl : insets.bottom + spacing.xl;
  const content = { paddingHorizontal: spacing.lg, paddingTop: sticky ? spacing.sm : 34, paddingBottom: pb };
  return (
    <View testID={testID} style={{ flex: 1, backgroundColor: colors.parchment }}>
      <AppHeader title={title} icon={icon} back={back} />
      {sticky ? <View style={{ paddingTop: 30, backgroundColor: colors.parchment }}>{sticky}</View> : null}
      {keyboard ? (
        <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={content}>{children}</KeyboardAwareScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.gold} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }} />}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
}
