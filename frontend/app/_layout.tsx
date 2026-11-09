import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, LogBox, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { LanguageSheet, Toast } from "@/src/components/Overlays";
import { SideMenu } from "@/src/components/SideMenu";
import { queryClient } from "@/src/query-client";
import { AppProvider, useApp } from "@/src/store/AppContext";
import { colors } from "@/src/theme";

LogBox.ignoreAllLogs(true);

function Shell() {
  const { ready } = useApp();
  if (!ready) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator testID="app-loading" size="large" color={colors.gold} />
      </View>
    );
  }
  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.parchment } }} />
      <SideMenu />
      <LanguageSheet />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Crimson: require("../assets/fonts/CrimsonText-Regular.ttf"),
    CrimsonSemi: require("../assets/fonts/CrimsonText-SemiBold.ttf"),
    CrimsonBold: require("../assets/fonts/CrimsonText-Bold.ttf"),
    NotoTelugu: require("../assets/fonts/NotoSerifTelugu.ttf"),
    Ramabhadra: require("../assets/fonts/Ramabhadra-Regular.ttf"),
    Gurajada: require("../assets/fonts/Gurajada-Regular.ttf"),
    NotoDeva: require("../assets/fonts/NotoSerifDevanagari.ttf"),
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <KeyboardProvider>
            <StatusBar style="light" />
            {loaded || error ? (
              <AppProvider>
                <Shell />
              </AppProvider>
            ) : (
              <View style={[styles.root, styles.center]} />
            )}
          </KeyboardProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.parchment },
  center: { alignItems: "center", justifyContent: "center" },
});
