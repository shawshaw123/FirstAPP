import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { useEffect } from "react";
import '../Firebase/config';  // Add this import to initialize Firebase
import { Platform, StatusBar, View } from "react-native";
import { ErrorBoundary } from "@/app/error-boundary";
import { ThemeProvider, useTheme } from "@/components/theme-context";
import { logger } from "@/services/loggers";
import { backgroundTaskManager } from "@/services/background-task";
import { concurrentQueue } from "@/services/concurrent-queue";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      logger.error("Font loading error", error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Initialize services
      Promise.all([
        logger.init(),
        backgroundTaskManager.init(),
      ]).then(() => {
        logger.info("App initialized successfully");
        SplashScreen.hideAsync();
      }).catch(error => {
        logger.error("Failed to initialize app", error);
        SplashScreen.hideAsync();
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider defaultTheme="dark">
        <RootLayoutNav />
      </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { colors } = useTheme();

  // Log navigation events
  useEffect(() => {
    logger.info("App started", {
      platform: Platform.OS,
      version: Platform.Version,
    });

    return () => {
      logger.info("App closed");
    };
  }, []);

  return (
      <View style={{ flex: 1, backgroundColor: "#000000" }}>
        <StatusBar
            barStyle="light-content"
            backgroundColor="#000000"
        />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="map" options={{ headerShown: false }} />
          <Stack.Screen name="rentals" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="scan" options={{ headerShown: false }} />
          <Stack.Screen name="station/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
        </Stack>
      </View>
  );
}