import { Redirect } from "expo-router";

import { useApp } from "@/src/store/AppContext";

export default function Index() {
  const { prefs } = useApp();
  return <Redirect href={prefs.onboarded ? "/(tabs)" : "/language?onboarding=1"} />;
}
