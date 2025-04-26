import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/components/theme-context";
import { Eye, EyeOff, Mail, User, Lock, CreditCard } from "lucide-react-native";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  icon?: "mail" | "user" | "lock" | "card";
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus?: boolean;
}

export default function Input({
                                value,
                                onChangeText,
                                placeholder,
                                secureTextEntry = false,
                                autoCapitalize = "none",
                                keyboardType = "default",
                                icon,
                                error,
                                containerStyle,
                                inputStyle,
                                autoFocus = false,
                              }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors } = useTheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const renderIcon = () => {
    switch (icon) {
      case "mail":
        return <Mail size={20} color={colors.textSecondary} />;
      case "user":
        return <User size={20} color={colors.textSecondary} />;
      case "lock":
        return <Lock size={20} color={colors.textSecondary} />;
      case "card":
        return <CreditCard size={20} color={colors.textSecondary} />;
      default:
        return null;
    }
  };

  return (
      <View style={[styles.container, containerStyle]}>
        <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.cardBackground, borderColor: colors.border },
              error ? { borderColor: colors.error } : null,
            ]}
        >
          {icon && <View style={styles.iconContainer}>{renderIcon()}</View>}
          <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              autoCapitalize={autoCapitalize}
              keyboardType={keyboardType}
              style={[
                styles.input,
                { color: colors.text },
                icon ? styles.inputWithIcon : null,
                inputStyle
              ]}
              autoFocus={autoFocus}
          />
          {secureTextEntry && (
              <TouchableOpacity
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
              >
                {isPasswordVisible ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                ) : (
                    <Eye size={20} color={colors.textSecondary} />
                )}
              </TouchableOpacity>
          )}
        </View>
        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});