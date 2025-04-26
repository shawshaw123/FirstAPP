import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import TabBar from "@/components/TabBar";
import RentalHistoryCard from "@/components/RentalHistoryCard";
import { useAuthStore } from "@/store/auth-store";
import { useRentalStore } from "@/store/rental-store";
import { Clock } from "lucide-react-native";

export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { history, isLoading, error, loadRentalHistory } = useRentalStore();
  const { colors } = useTheme();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      if (!isAuthenticated) {
        setTimeout(() => {
          router.replace("/");
        }, 100);
      }
    };

    checkAuth();
    loadRentalHistory();
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: "#FFFFFF" }]}>History</Text>
          <Clock size={24} color="#FFFFFF" />
        </View>

        {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00C853" />
              <Text style={[styles.loadingText, { color: "#FFFFFF" }]}>Loading rental history...</Text>
            </View>
        ) : (
            <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RentalHistoryCard rental={item} />}
                contentContainerStyle={styles.historyList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: "#AAAAAA" }]}>No rental history yet</Text>
                  </View>
                }
                refreshing={isLoading}
                onRefresh={loadRentalHistory}
            />
        )}

        <TabBar />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  historyList: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});