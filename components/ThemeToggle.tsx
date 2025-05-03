import React from "react";
import { TouchableOpacity, StyleSheet, Animated, Easing, Platform, Pressable } from "react-native";
import { useTheme } from "@/components/theme-context";
import { Sun, Moon } from "lucide-react-native";

interface ThemeToggleProps {
  size?: number;
}

export default function ThemeToggle({ size = 24 }: ThemeToggleProps) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [rotation] = React.useState(new Animated.Value(0));

  const handleToggle = () => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0);
      toggleTheme();
    });
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Use Pressable on Android for better touch feedback
  const ButtonComponent = Platform.OS === 'android' ? Pressable : TouchableOpacity;

  return (
      <ButtonComponent
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.cardBackground : colors.cardBackgroundAlt,
              elevation: Platform.OS === 'android' ? 4 : 0,
            },
          ]}
          onPress={handleToggle}
          activeOpacity={Platform.OS === 'ios' ? 0.7 : undefined}
          android_ripple={Platform.OS === 'android' ? { 
            color: colors.primary + '20',
            borderless: true,
            radius: 20
          } : undefined}
      >
        <Animated.View 
          style={{ 
            transform: [{ rotate: spin }],
            backfaceVisibility: 'hidden', // Improves performance on Android
          }}
        >
          {isDark ? (
              <Sun size={size} color={colors.text} />
          ) : (
              <Moon size={size} color={colors.text} />
          )}
        </Animated.View>
      </ButtonComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    // Add platform-specific shadow styles
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        // Android elevation is handled in the component style prop
      }
    }),
  },
});