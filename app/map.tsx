import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import BikeStationCard from "@/components/BikeStationCard";
import TabBar from "@/components/TabBar";
import { useAuthStore } from "@/store/auth-store";
import { useStationStore } from "@/store/station-store";
import { Search, MapPin, QrCode, Navigation } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLogging } from "@/hooks/use-logging";

const { width, height } = Dimensions.get("window");

export default function MapScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    stations,
    isLoading,
    error,
    loadStations,
    searchStations
  } = useStationStore();
  const { colors } = useTheme();
  const { logInfo } = useLogging();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStations, setFilteredStations] = useState(stations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: 37.7749, longitude: -122.4194 });

  const mapRef = useRef(null);
  const flatListRef = useRef(null);

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

    // Log screen view
    logInfo("Map screen viewed", { userId: user?.id });
  }, [isAuthenticated]);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    setFilteredStations(searchStations(searchQuery));
  }, [searchQuery, stations]);

  const handleStationPress = (stationId: string) => {
    logInfo("User selected station", { stationId });
    router.push(`/station/${stationId}`); // Fixed the space in the URL path
  };

  const handleFindNearby = () => {
    // In a real app, this would use geolocation
    logInfo("User requested nearby stations");
    loadStations();
  };

  const handleScanQR = () => {
    logInfo("User navigating to scan QR");
    router.push("/scan");
  };

  // Render a simple map preview with station markers
  const renderMapPreview = () => {
    return (
        <View style={[styles.mapPreview, { backgroundColor: "#121212" }]}>
          <LinearGradient
              colors={["#121212", "#1A1A1A"]}
              style={styles.mapGradient}
          >
            {/* Map grid lines */}
            <View style={styles.mapGrid}>
              {Array(5).fill(0).map((_, i) => (
                  <View key={`h-${i}`} style={[styles.gridLineHorizontal, {
                    backgroundColor: "#333333",
                    top: `${20 + i * 15}%`
                  }]} />
              ))}
              {Array(5).fill(0).map((_, i) => (
                  <View key={`v-${i}`} style={[styles.gridLineVertical, {
                    backgroundColor: "#333333",
                    left: `${20 + i * 15}%`
                  }]} />
              ))}
            </View>

            {/* Station markers */}
            {stations.slice(0, 5).map((station) => (
                <TouchableOpacity
                    key={station.id}
                    style={[
                      styles.stationMarker,
                      {
                        left: `${30 + Math.random() * 40}%`,
                        top: `${20 + Math.random() * 60}%`,
                        backgroundColor: station.availableBikes > 0 ? "#00C853" : "#FF5252"
                      }
                    ]}
                    onPress={() => handleStationPress(station.id)}
                >
                  <Text style={styles.stationMarkerText}>{station.availableBikes}</Text>
                </TouchableOpacity>
            ))}

            {/* User location marker */}
            <View style={[styles.userMarker, { backgroundColor: "#7C4DFF" }]}>
              <Navigation size={12} color="#FFFFFF" />
            </View>

            {/* Find nearby button */}
            <TouchableOpacity
                style={[styles.findNearbyButton, { backgroundColor: "#00C85320" }]}
                onPress={handleFindNearby}
            >
              <MapPin size={20} color="#00C853" />
              <Text style={[styles.findNearbyText, { color: "#FFFFFF" }]}>Find bikes near you!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
    );
  };

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
        <StatusBar backgroundColor="#000000" barStyle="light-content" />
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logo, { color: "#00C853" }]}>Forda GO</Text>
            <TouchableOpacity 
                style={styles.qrButton} 
                onPress={handleScanQR}
                activeOpacity={0.7}
            >
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

        {renderMapPreview()}

        <View style={styles.stationsContainer}>
          <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>Nearby Stations</Text>

          {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00C853" />
                <Text style={[styles.loadingText, { color: "#AAAAAA" }]}>
                  Finding stations...
                </Text>
              </View>
          ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: "#FF5252" }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: "#00C853" }]}
                    onPress={loadStations}
                    activeOpacity={0.7}
                >
                  <Text style={[styles.retryText, { color: "#FFFFFF" }]}>Retry</Text>
                </TouchableOpacity>
              </View>
          ) : (
              <FlatList
                  ref={flatListRef}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#121212",
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  qrButton: {
    padding: 10,
    backgroundColor: "#121212",
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  mapPreview: {
    height: 220,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    overflow: "hidden",
    elevation: 4,
  },
  mapGradient: {
    flex: 1,
    position: "relative",
  },
  mapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  stationMarker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  stationMarkerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  userMarker: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: -18,
    marginTop: -18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  findNearbyButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
  },
  findNearbyText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  stationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 70, // Space for TabBar
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  stationsList: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // Prevents overlap with TabBar
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 80, // Prevents overlap with TabBar
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
  },
  retryText: {
    fontWeight: "600",
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});