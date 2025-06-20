import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Login Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await login(email, password);
    if (success) {
      router.replace("/map");
    }
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleBack = () => {
    router.back();
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar backgroundColor={colors.background} barStyle="light-content" />
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
        >
          <ScrollView 
              contentContainerStyle={styles.scrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <TouchableOpacity 
                  onPress={handleBack} 
                  style={styles.backButton}
                  activeOpacity={0.7}
              >
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Log in</Text>
            </View>

            <View style={styles.content}>
              <Text style={[styles.title, { color: colors.text }]}>WELCOME</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Log in with your student credential to continue
              </Text>

              <View style={styles.form}>
                <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your E-mail"
                    keyboardType="email-address"
                    icon="mail"
                    error={errors.email}
                    autoFocus
                />

                <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    icon="lock"
                    error={errors.password}
                />

                <TouchableOpacity 
                    style={styles.forgotPassword}
                    activeOpacity={0.7}
                >
                  <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Button
                    title="Log In"
                    onPress={handleLogin}
                    isLoading={isLoading}
                    style={styles.loginButton}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Don't have an account? 
              </Text>
              <TouchableOpacity 
                  onPress={handleSignUp}
                  activeOpacity={0.7}
              >
                <Text style={[styles.signUpText, { color: colors.primary }]}>
                  Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    marginBottom: 48,
  },
  backButton: {
    padding: 10,
    marginRight: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 48,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  form: {
    width: "100%",
    marginTop: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 32,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 8,
    height: 56,
    borderRadius: 12,
    elevation: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
  },
  signUpText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
});