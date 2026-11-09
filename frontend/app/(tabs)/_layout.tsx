import { Tabs } from "expo-router";

import { TabBar } from "@/src/components/TabBar";
import { colors } from "@/src/theme";

// Custom maroon-and-gold tab bar on every platform to match the reference design.
export default function TabsLayout() {
  return (
    <Tabs tabBar={(p: any) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.parchment } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="books" />
      <Tabs.Screen name="bookmarks" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
