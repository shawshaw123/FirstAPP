import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ModalScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
              activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Modal</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.separator} />
          <Text style={styles.text}>
            This is an example modal. You can edit it in app/modal.tsx.
          </Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Modal screens are useful for displaying additional information or requesting user input without navigating away from the current context.
            </Text>
          </View>
        </View>

        {/* Use a light status bar on iOS to account for the black space above the modal */}
        <StatusBar style={Platform.OS === "ios" ? "light" : "light"} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 10,
    marginRight: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 500,
    marginTop: Platform.OS === 'ios' ? 80 : 60,
  },
  text: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
    backgroundColor: "#333333",
  },
  infoBox: {
    backgroundColor: "#00C85320",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#00C85340",
  },
  infoText: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});