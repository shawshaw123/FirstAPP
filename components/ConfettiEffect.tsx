import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "@/components/theme-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONFETTI_COUNT = 50;

interface ConfettiProps {
  onComplete?: () => void;
}

const generateConfetti = (colors: string[]) => {
  return Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
    const size = Math.random() * 10 + 5;
    const type = Math.floor(Math.random() * 3); // 0: circle, 1: square, 2: rectangle
    const color = colors[Math.floor(Math.random() * colors.length)];
    const initialX = Math.random() * SCREEN_WIDTH;
    const initialY = -20 - Math.random() * 100;
    const finalX = initialX + (Math.random() * 200 - 100);
    const finalY = SCREEN_HEIGHT + 20;
    const rotation = Math.random() * 360;
    const duration = Math.random() * 2000 + 2000;
    const delay = Math.random() * 1000;

    return {
      id: index,
      size,
      type,
      color,
      initialX,
      initialY,
      finalX,
      finalY,
      rotation,
      duration,
      delay,
    };
  });
};

export default function ConfettiEffect({ onComplete }: ConfettiProps) {
  const { colors } = useTheme();

  const confettiColors = [
    colors.primary,
    colors.secondary,
    colors.primaryLight,
    colors.secondaryLight,
    "#FF9800", // Orange
    "#E91E63", // Pink
  ];

  const confetti = generateConfetti(confettiColors);

  const animationComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
      <View style={styles.container} pointerEvents="none">
        {confetti.map((item) => (
            <ConfettiPiece
                key={item.id}
                item={item}
                isLast={item.id === CONFETTI_COUNT - 1}
                onComplete={animationComplete}
            />
        ))}
      </View>
  );
}

interface ConfettiPieceProps {
  item: {
    id: number;
    size: number;
    type: number;
    color: string;
    initialX: number;
    initialY: number;
    finalX: number;
    finalY: number;
    rotation: number;
    duration: number;
    delay: number;
  };
  isLast: boolean;
  onComplete?: () => void;
}

function ConfettiPiece({ item, isLast, onComplete }: ConfettiPieceProps) {
  const translateY = useSharedValue(item.initialY);
  const translateX = useSharedValue(item.initialX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Start falling animation
    translateY.value = withDelay(
        item.delay,
        withTiming(item.finalY, { duration: item.duration, easing: Easing.bezier(0.1, 0.25, 0.1, 1) })
    );

    // Side-to-side animation
    translateX.value = withDelay(
        item.delay,
        withTiming(item.finalX, { duration: item.duration, easing: Easing.bezier(0.1, 0.25, 0.1, 1) })
    );

    // Rotation animation
    rotate.value = withDelay(
        item.delay,
        withTiming(item.rotation, { duration: item.duration, easing: Easing.linear })
    );

    // Fade out at the end
    opacity.value = withDelay(
        item.delay + item.duration - 500,
        withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }, () => {
          if (isLast && onComplete) {
            runOnJS(onComplete)();
          }
        })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const renderConfettiShape = () => {
    switch (item.type) {
      case 0: // Circle
        return (
            <View
                style={[
                  styles.circle,
                  {
                    width: item.size,
                    height: item.size,
                    backgroundColor: item.color,
                  },
                ]}
            />
        );
      case 1: // Square
        return (
            <View
                style={[
                  styles.square,
                  {
                    width: item.size,
                    height: item.size,
                    backgroundColor: item.color,
                  },
                ]}
            />
        );
      case 2: // Rectangle
        return (
            <View
                style={[
                  styles.rectangle,
                  {
                    width: item.size * 2,
                    height: item.size,
                    backgroundColor: item.color,
                  },
                ]}
            />
        );
      default:
        return null;
    }
  };

  return (
      <Animated.View style={[styles.confettiPiece, animatedStyle]}>
        {renderConfettiShape()}
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confettiPiece: {
    position: "absolute",
  },
  circle: {
    borderRadius: 50,
  },
  square: {},
  rectangle: {},
});