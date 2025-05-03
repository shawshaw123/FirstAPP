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
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useAuthStore } from "@/store/auth-store";
import { ArrowLeft } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", studentId: "", password: "" };

    if (!name) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!studentId) {
      newErrors.studentId = "Student ID is required";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register(name, email, studentId, password);
    if (success) {
      router.replace("/map");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.dark.background} barStyle="light-content" />
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
                <ArrowLeft size={24} color={Colors.light.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>CREATE ACCOUNT</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>ACCOUNT</Text>
              <Text style={styles.subtitle}>
                Sign up to start renting bikes:
              </Text>

              <View style={styles.form}>
                <Text style={styles.sectionTitle}>FULL NAME</Text>
                <Input
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    icon="user"
                    error={errors.name}
                    autoFocus
                />

                <Text style={styles.sectionTitle}>EMAIL</Text>
                <Input
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your E-mail"
                    keyboardType="email-address"
                    icon="mail"
                    error={errors.email}
                />

                <Text style={styles.sectionTitle}>STUDENT ID</Text>
                <Input
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="Enter your Student ID"
                    icon="card"
                    error={errors.studentId}
                />

                <Text style={styles.sectionTitle}>PASSWORD</Text>
                <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    secureTextEntry
                    icon="lock"
                    error={errors.password}
                />

                <View style={styles.createButtonContainer}>
                  <Text style={styles.createText}>CREATE</Text>
                  <Button
                      title="CREATE ACCOUNT"
                      onPress={handleRegister}
                      isLoading={isLoading}
                      style={styles.createButton}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 20 : 16,
    marginBottom: 32,
  },
  backButton: {
    padding: 10,
    marginRight: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  form: {
    width: "100%",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    marginTop: 16,
    letterSpacing: 0.5,
  },
  createButtonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  createText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  createButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    elevation: 3,
  },
});