import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/components/theme-context";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text" | "gradient";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export default function Button({
                                 title,
                                 onPress,
                                 variant = "primary",
                                 size = "medium",
                                 isLoading = false,
                                 disabled = false,
                                 style,
                                 textStyle,
                                 icon,
                                 iconPosition = "left",
                               }: ButtonProps) {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryButton;
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "text":
        return styles.textButton;
      case "gradient":
        return styles.gradientButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primaryText;
      case "secondary":
        return styles.secondaryText;
      case "outline":
        return styles.outlineText;
      case "text":
        return styles.textButtonText;
      case "gradient":
        return styles.gradientText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "medium":
        return styles.mediumButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const renderContent = () => {
    return (
        <>
          {isLoading ? (
              <ActivityIndicator
                  color={variant === "outline" ? colors.primary : colors.text}
              />
          ) : (
              <>
                {icon && iconPosition === "left" && (
                    <View style={styles.iconLeft}>{icon}</View>
                )}
                <Text
                    style={[
                      getTextStyle(),
                      textStyle,
                      { color: variant === "outline" ? colors.text : getTextStyle().color }
                    ]}
                >
                  {title}
                </Text>
                {icon && iconPosition === "right" && (
                    <View style={styles.iconRight}>{icon}</View>
                )}
              </>
          )}
        </>
    );
  };

  if (variant === "gradient") {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={isLoading || disabled}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.button,
                  getButtonStyle(),
                  getSizeStyle(),
                  disabled && styles.disabledButton,
                  style,
                ]}
            >
              {renderContent()}
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
    );
  }

  return (
      <TouchableOpacity
          style={[
            styles.button,
            getButtonStyle(),
            getSizeStyle(),
            disabled && styles.disabledButton,
            style,
          ]}
          onPress={onPress}
          disabled={isLoading || disabled}
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
      >
        <Animated.View
            style={[
              styles.contentContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
        >
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
  );
}

const View = Animated.createAnimatedComponent(TouchableOpacity);

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#00C853",
  },
  secondaryButton: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#00C853",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#333333",
  },
  textButton: {
    backgroundColor: "transparent",
  },
  gradientButton: {
    backgroundColor: "transparent",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryText: {
    color: "#00C853",
    fontWeight: "600",
    fontSize: 16,
  },
  outlineText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  textButtonText: {
    color: "#00C853",
    fontWeight: "600",
    fontSize: 16,
  },
  gradientText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});