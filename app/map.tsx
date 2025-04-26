import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import BikeStationCard from "@/components/BikeStationCard";
import TabBar from "@/components/TabBar";
import { useAuthStore } from "@/components/auth-store";
import { useStationStore } from "@/components/station-store";
import { Search, MapPin, QrCode } from "lucide-react-native";

export default function MapScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    stations,
    isLoading,
    error,
    loadStations,
    searchStations
  } = useStationStore();
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStations, setFilteredStations] = useState(stations);

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
  }, [isAuthenticated]);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    setFilteredStations(searchStations(searchQuery));
  }, [searchQuery, stations]);

  const handleStationPress = (stationId: string) => {
    router.push(`/station/${stationId}`);
  };

  const handleFindNearby = () => {
    // In a real app, this would use geolocation
    loadStations();
  };

  const handleScanQR = () => {
    router.push("/scan");
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logo, { color: "#00C853" }]}>Forda GO</Text>
            <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
              <QrCode size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: "#121212" }]}>
            <Search size={20} color="#AAAAAA" style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: "#FFFFFF" }]}
                placeholder="Search stations..."
                placeholderTextColor="#AAAAAA"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={[styles.mapPreview, { backgroundColor: "#121212" }]}>
          <TouchableOpacity
              style={[styles.findNearbyButton, { backgroundColor: "#00C85310" }]}
              onPress={handleFindNearby}
          >
            <MapPin size={20} color="#00C853" />
            <Text style={[styles.findNearbyText, { color: "#FFFFFF" }]}>Find bikes near you!</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stationsContainer}>
          <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>Nearby Stations</Text>

          {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C853" />
              </View>
          ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: "#FF5252" }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: "#00C853" }]}
                    onPress={loadStations}
                >
                  <Text style={[styles.retryText, { color: "#FFFFFF" }]}>Retry</Text>
                </TouchableOpacity>
              </View>
          ) : (
              <FlatList
                  data={filteredStations}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                      <BikeStationCard
                          station={item}
                          onPress={() => handleStationPress(item.id)}
                      />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.stationsList}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={[styles.emptyText, { color: "#AAAAAA" }]}>
                        No stations found. Try a different search.
                      </Text>
                    </View>
                  }
              />
          )}
        </View>

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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  qrButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  mapPreview: {
    height: 160,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  findNearbyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  findNearbyText: {
    marginLeft: 8,
    fontSize: 16,
  },
  stationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stationsList: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
  },
});