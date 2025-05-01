import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  AppState
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { Bike, ChevronRight } from "lucide-react-native";
import { useTheme } from "@/components/theme-context";
import { useLogging } from "@/hooks/use-logging";
import { backgroundTaskManager, TaskType } from "@/services/background-task";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const { logInfo } = useLogging();
  const appState = useRef(AppState.currentState);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bikePosition = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Log screen view
    logInfo("Welcome screen viewed");

    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
      Animated.timing(bikePosition, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();

    // Check authentication after animations
    const checkAuth = async () => {
      if (isAuthenticated) {
        logInfo("User already authenticated, redirecting to map");
        setTimeout(() => {
          router.replace("/map");
        }, 500);
      }
    };

    checkAuth();

    // Set up app state change listener for background processing demo
    const subscription = AppState.addEventListener("change", nextAppState => {
      logInfo("App state changed", { from: appState.current, to: nextAppState });

      // If app is going to background, schedule a background task
      if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        // Schedule a demo background task
        backgroundTaskManager.scheduleTask(TaskType.DATA_SYNC, {
          message: "Background task scheduled when app went to background",
          timestamp: new Date().toISOString()
        });
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    logInfo("User clicked Get Started button");
    router.push("/login");
  };

  // Bike animation
  const bikeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
        Animated.sequence([
          Animated.timing(bikeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
          Animated.timing(bikeAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.quad),
          }),
        ])
    ).start();
  }, []);

  const bikeTranslateY = bikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
      <View style={styles.container}>
        <LinearGradient
            colors={["#000000", "#00C85310"] as const}
            style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <Animated.View
                  style={[
                    styles.logoContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                      backgroundColor: "#00C85320"
                    }
                  ]}
              >
                <Animated.View
                    style={{
                      transform: [
                        { translateX: bikePosition },
                        { translateY: bikeTranslateY },
                      ],
                    }}
                >
                  <Bike size={80} color="#00C853" />
                </Animated.View>
              </Animated.View>

              <Animated.View
                  style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  }}
              >
                <Text style={[styles.title, { color: "#FFFFFF" }]}>Forda GO</Text>
                <Text style={[styles.subtitle, { color: "#AAAAAA" }]}>Campus E-bike Rental</Text>
              </Animated.View>

              <Animated.View
                  style={[
                    styles.descriptionContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
              >
                <Text style={[styles.description, { color: "#AAAAAA" }]}>
                  Rent e-bikes easily, save time, and reduce your carbon footprint while getting around campus.
                </Text>
              </Animated.View>

              <Animated.View
                  style={[
                    styles.featuresContainer,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
              >
                <View style={styles.featureRow}>
                  <View style={[styles.featureNumber, { backgroundColor: "#00C85320" }]}>
                    <Text style={[styles.featureNumberText, { color: "#00C853" }]}>1</Text>
                  </View>
                  <Text style={[styles.featureText, { color: "#FFFFFF" }]}>Find available bikes near you</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.featureNumber, { backgroundColor: "#00C85320" }]}>
                    <Text style={[styles.featureNumberText, { color: "#00C853" }]}>2</Text>
                  </View>
                  <Text style={[styles.featureText, { color: "#FFFFFF" }]}>Unlock with QR code</Text>
                </View>
                <View style={styles.featureRow}>
                  <View style={[styles.featureNumber, { backgroundColor: "#00C85320" }]}>
                    <Text style={[styles.featureNumberText, { color: "#00C853" }]}>3</Text>
                  </View>
                  <Text style={[styles.featureText, { color: "#FFFFFF" }]}>Track your rides and save time</Text>
                </View>
              </Animated.View>
            </View>

            <Animated.View
                style={[
                  styles.footer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
            >
              <Button
                  title="Get Started"
                  onPress={handleGetStarted}
                  variant="gradient"
                  size="large"
                  style={styles.button}
                  icon={<ChevronRight size={20} color="#fff" />}
                  iconPosition="right"
              />
              <View style={[styles.indicator, { backgroundColor: "#333333" }]} />
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    width: "100%",
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureNumberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  button: {
    width: "100%",
    marginBottom: 24,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});