import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useTheme } from "@/components/theme-context";
import { useAuthStore } from "@/store/auth-store";

export default function WalletBalance() {
  const { user } = useAuthStore();
  const { colors } = useTheme();

  return (
      <View style={styles.container}>
        <Text style={[
          styles.label, 
          { 
            color: "#AAAAAA",
            textAlign: 'center',
            letterSpacing: Platform.OS === 'android' ? 0.25 : 0
          }
        ]}>
          Wallet Balance
        </Text>
        <View style={[
          styles.balanceContainer, 
          { 
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            elevation: Platform.OS === 'android' ? 2 : 0,
            shadowColor: Platform.OS === 'ios' ? "#000" : "transparent",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.5,
          }
        ]}>
          <Text style={[
            styles.currency, 
            { 
              color: "#FFFFFF",
              fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : undefined
            }
          ]}>
            ₱
          </Text>
          <Text style={[
            styles.balance, 
            { 
              color: "#FFFFFF",
              fontFamily: Platform.OS === 'android' ? 'sans-serif-medium' : undefined
            }
          ]}>
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
    alignItems: 'center', // Center children horizontally
    justifyContent: 'center', // Center children vertically
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    width: '100%', // Ensure the label takes full width
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the currency and balance
    borderRadius: Platform.OS === 'android' ? 8 : 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 120, // Ensure minimum width for better appearance
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