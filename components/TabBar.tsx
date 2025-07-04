import React from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Platform, Dimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Map, Bike, Clock, User } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing
} from "react-native-reanimated";
import { useTheme } from "@/components/theme-context";

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  const tabs = [
    {
      name: "Map",
      icon: Map,
      path: "/map",
    },
    {
      name: "Rentals",
      icon: Bike,
      path: "/rentals",
    },
    {
      name: "History",
      icon: Clock,
      path: "/history",
    },
    {
      name: "Profile",
      icon: User,
      path: "/profile",
    },
  ];


  return (
      <View style={[
        styles.container, 
        { 
          backgroundColor: colors.tabBarBackground, 
          borderTopColor: colors.border,
          elevation: Platform.OS === 'android' ? 8 : 0,
        }
      ]}>
        {tabs.map((tab) => (
            <TabButton
                key={tab.name}
                tab={tab}
                isActive={pathname === tab.path}
                onPress={() => {
                  if (tab.path === "/map") router.push("/map");
                  else if (tab.path === "/rentals") router.push("/rentals");
                  else if (tab.path === "/history") router.push("/history");
                  else if (tab.path === "/profile") router.push("/profile");
                }}
            />
        ))}
      </View>
  );
}

interface TabButtonProps {
  tab: {
    name: string;
    icon: any;
    path: any;
  };
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(isActive ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [isActive]);

  const handlePressIn = () => {
    scale.value = withTiming(0.9, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
      <Pressable
          style={styles.tab}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{
            color: colors.primary + '20',
            borderless: true,
            radius: 20
          }}
      >
        <Animated.View style={[styles.tabContent, animatedStyle]}>
          <Animated.View
              style={[
                styles.activeBackground,
                backgroundStyle,
                { backgroundColor: colors.primary + "20" }
              ]}
          />
          <tab.icon
              size={24}
              color={isActive ? colors.primary : colors.tabBarInactive}
          />
          <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? colors.primary : colors.tabBarInactive,
                  fontWeight: isActive ? "500" : "normal",
                  letterSpacing: Platform.OS === 'android' ? 0.3 : 0
                },
              ]}
          >
            {tab.name}
          </Text>
        </Animated.View>
      </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 12,
    shadowColor: Platform.OS === 'ios' ? "#000" : "transparent",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: Platform.OS === 'android' ? 56 : 50,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "100%",
    position: "relative",
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    left: 8,
    right: 8,
    bottom: 0,
    borderRadius: Platform.OS === 'android' ? 8 : 16,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
});