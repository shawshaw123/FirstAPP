import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/components/theme-context";
import { useAuthStore } from "@/components/auth-store";

export default function WalletBalance() {
  const { user } = useAuthStore();

  return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: "#AAAAAA" }]}>Wallet Balance</Text>
        <View style={[styles.balanceContainer, { backgroundColor: "rgba(255, 255, 255, 0.1)" }]}>
          <Text style={[styles.currency, { color: "#FFFFFF" }]}>₱</Text>
          <Text style={[styles.balance, { color: "#FFFFFF" }]}>
            {user?.walletBalance.toLocaleString()}
          </Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  currency: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 4,
  },
  balance: {
    fontSize: 18,
    fontWeight: "bold",
  },
});