import React from "react";
import { TouchableOpacity, StyleSheet, Animated, Easing } from "react-native";
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

  return (
      <TouchableOpacity
          style={[
            styles.container,
            {
              backgroundColor: isDark ? colors.cardBackground : colors.cardBackgroundAlt,
            },
          ]}
          onPress={handleToggle}
          activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          {isDark ? (
              <Sun size={size} color={colors.text} />
          ) : (
              <Moon size={size} color={colors.text} />
          )}
        </Animated.View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});