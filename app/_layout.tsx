import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import AuthScreen from "@/components/AuthScreen";
import { useAuth } from "@/hooks/useAuth";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useIsClient } from "@/hooks/useIsClient";

// Note: CSS import temporarily disabled due to bundling issues
// import "../global.css";

function AppContent() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-green-50">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const isClient = useIsClient();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Don't wait for fonts during SSR
  if (!loaded && !isClient) {
    return null;
  }

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return <AppContent />;
}
