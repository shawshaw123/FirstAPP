import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/components/theme-context";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: "low" | "medium" | "high";
  direction?: "vertical" | "horizontal" | "diagonal";
}

export default function GradientCard({
                                       children,
                                       style,
                                       intensity = "low",
                                       direction = "vertical",
                                     }: GradientCardProps) {
  // Define gradient colors based on intensity
  const getGradientColors = () => {
    switch (intensity) {
      case "high":
        return ["#121212", "#00C85320"] as const;
      case "medium":
        return ["#121212", "#00C85315"] as const;
      case "low":
      default:
        return ["#121212", "#1A1A1A"] as const;
    }
  };

  // Define gradient direction
  const getGradientStart = () => {
    switch (direction) {
      case "horizontal":
        return { x: 0, y: 0.5 };
      case "diagonal":
        return { x: 0, y: 0 };
      case "vertical":
      default:
        return { x: 0.5, y: 0 };
    }
  };

  const getGradientEnd = () => {
    switch (direction) {
      case "horizontal":
        return { x: 1, y: 0.5 };
      case "diagonal":
        return { x: 1, y: 1 };
      case "vertical":
      default:
        return { x: 0.5, y: 1 };
    }
  };

  return (
      <LinearGradient
          colors={getGradientColors()}
          start={getGradientStart()}
          end={getGradientEnd()}
          style={[styles.container, style]}
      >
        <View style={styles.content}>{children}</View>
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
});