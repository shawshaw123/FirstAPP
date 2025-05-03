import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import TabBar from "@/components/TabBar";
import RentalHistoryCard from "@/components/RentalHistoryCard";
import { useAuthStore } from "@/store/auth-store";
import { useRentalStore } from "@/store/rental-store";
import { Clock } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { history, isLoading, error, loadRentalHistory } = useRentalStore();
  const { colors } = useTheme();

  useEffect(() => {
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
      <>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: "#FFFFFF" }]}>History</Text>
              <Clock size={24} color="#FFFFFF" />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00C853" />
                  <Text style={[styles.loadingText, { color: "#FFFFFF" }]}>
                    Loading rental history...
                  </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <RentalHistoryCard rental={item} />}
                    contentContainerStyle={[
                      styles.historyList,
                      history.length === 0 && styles.emptyListContainer
                    ]}
                    ListEmptyComponent={
                      <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: "#AAAAAA" }]}>
                          No rental history yet
                        </Text>
                      </View>
                    }
                    refreshing={isLoading}
                    onRefresh={loadRentalHistory}
                    showsVerticalScrollIndicator={false}
                />
            )}
          </View>
          <TabBar />
        </SafeAreaView>
      </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    flex: 1,
    paddingBottom: 70, // Increased space for TabBar
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100, // Prevents overlap with TabBar
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    height: '100%',
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    color: "#AAAAAA",
    lineHeight: 24,
  },
});