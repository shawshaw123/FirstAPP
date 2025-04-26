import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  withDelay,
  cancelAnimation,
} from "react-native-reanimated";
import { Bike } from "lucide-react-native";
import { useTheme } from "@/components/theme-context";

interface AnimatedBikeProps {
  size?: number;
  isRiding?: boolean;
}

export default function AnimatedBike({
                                       size = 80,
                                       isRiding = true
                                     }: AnimatedBikeProps) {
  const { colors } = useTheme();

  const rotation = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isRiding) {
      // Wheel rotation animation
      rotation.value = withRepeat(
          withTiming(360, { duration: 1000, easing: Easing.linear }),
          -1, // Infinite repeat
          false // No reverse
      );

      // Bouncing animation
      translateY.value = withRepeat(
          withSequence(
              withTiming(-5, { duration: 500, easing: Easing.inOut(Easing.quad) }),
              withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) })
          ),
          -1, // Infinite repeat
          true // Reverse
      );

      // Side to side movement
      translateX.value = withRepeat(
          withSequence(
              withTiming(10, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
              withTiming(-10, { duration: 1200, easing: Easing.inOut(Easing.quad) })
          ),
          -1, // Infinite repeat
          true // Reverse
      );
    } else {
      // Stop animations
      cancelAnimation(rotation);
      cancelAnimation(translateY);
      cancelAnimation(translateX);

      // Reset values with a small delay
      rotation.value = withDelay(
          100,
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) })
      );
      translateY.value = withDelay(
          100,
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) })
      );
      translateX.value = withDelay(
          100,
          withTiming(0, { duration: 300, easing: Easing.inOut(Easing.quad) })
      );
    }

    return () => {
      cancelAnimation(rotation);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
    };
  }, [isRiding]);

  const wheelStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const bikeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
      ],
    };
  });

  return (
      <View style={styles.container}>
        <Animated.View style={[styles.shadowContainer, bikeStyle]}>
          <View style={[styles.shadow, { width: size * 0.8 }]} />
        </Animated.View>

        <Animated.View style={[styles.bikeContainer, bikeStyle]}>
          <Bike size={size} color={colors.primary} />
        </Animated.View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  bikeContainer: {
    position: "absolute",
  },
  shadowContainer: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  shadow: {
    height: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 10,
  },
});