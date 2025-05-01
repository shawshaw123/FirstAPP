import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Text, View } from "react-native";

export default function ModalScreen() {
  return (
      <View style={styles.container}>
        <Text style={styles.title}>Modal</Text>
        <View style={styles.separator} />
        <Text style={styles.text}>T</Text>


        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  text: {
    color: "#FFFFFF",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
    backgroundColor: "#333333",
  },
});