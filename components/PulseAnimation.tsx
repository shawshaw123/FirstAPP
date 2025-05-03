import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, ViewStyle, Platform } from "react-native";
import { useTheme } from "@/components/theme-context";

interface PulseAnimationProps {
  size?: number;
  color?: string;
  duration?: number;
  pulseMaxSize?: number;
  style?: ViewStyle;
  isActive?: boolean;
}

export default function PulseAnimation({
  size = 50,
  color,
  duration = 1500,
  pulseMaxSize = 100,
  style,
  isActive = true,
}: PulseAnimationProps) {
  const { colors } = useTheme();
  const pulseColor = color || colors.primary;
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  // Start animation
  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation;

    if (isActive) {
      animationLoop = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS === 'android',
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: Platform.OS === 'android',
          }),
        ])
      );

      animationLoop.start();
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [pulseAnim, opacityAnim, duration, isActive]);

  // Calculate animated values
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, pulseMaxSize / size],
  });

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: pulseColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: pulseColor,
            opacity: opacityAnim,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? "#000" : "transparent",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 3,
    elevation: Platform.OS === 'android' ? 0 : undefined,
  },
});