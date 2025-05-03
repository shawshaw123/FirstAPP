import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRentalStore } from "@/store/rental-store";
import { useStationStore } from "@/store/station-store";
import { X } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bikeId?: string, stationId?: string }>();
  const { startRental, isLoading, error } = useRentalStore();
  const { selectedStation, stationBikes } = useStationStore();

  const [scanning, setScanning] = useState(false);

  // If we have bikeId and stationId from params, we can skip the scanning
  const bikeId = params.bikeId;
  const stationId = params.stationId;

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
    }
  }, [error]);

  const handleCancel = () => {
    router.back();
  };

  const handleScanSuccess = async () => {
    setScanning(true);

    try {
      // If we have bikeId and stationId from params, use them
      // Otherwise in a real app, this would come from the QR code scan
      const actualBikeId = bikeId || "bike1";
      const actualStationId = stationId || "station1";

      // Find bike and station info
      let bikeName = "Forda Bike";
      let stationName = "Station";

      if (bikeId && stationBikes) {
        const bike = stationBikes.find(b => b.id === bikeId);
        if (bike) {
          bikeName = bike.name;
        }
      }

      if (stationId && selectedStation) {
        stationName = selectedStation.name;
      }

      await startRental(actualBikeId, bikeName, actualStationId, stationName);
      router.replace("/rentals");
    } catch (error) {
      console.error("Error starting rental:", error);
      Alert.alert("Error", "Failed to start rental. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.dark.background} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleCancel} 
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerContainer}>
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.scanTitle}>Scan Forda GO QR Code</Text>
          <Text style={styles.scanDescription}>
            Point your camera at the QR code on the bike or docking station
          </Text>

          <Button
              title="Scan QR Code"
              onPress={handleScanSuccess}
              style={styles.scanButton}
              isLoading={isLoading || scanning}
          />

          <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.cancelButton}
              disabled={isLoading || scanning}
          />
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20, // Better positioning on Android
  },
  scannerFrame: {
    width: width * 0.7, // Responsive width based on screen size
    height: width * 0.7, // Keep it square
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40, // Larger corners for better visibility
    height: 40,
    borderTopWidth: 3, // Thicker borders
    borderLeftWidth: 3,
    borderColor: Colors.light.text,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.text,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.light.text,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.text,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === "android" ? 32 : 24, // Extra padding on Android
    alignItems: "center",
    backgroundColor: Colors.dark.background,
    elevation: 4, // Add shadow on Android
  },
  scanTitle: {
    fontSize: 20, // Larger font
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5, // Better typography
  },
  scanDescription: {
    fontSize: 16, // Larger font
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22, // Better line height for readability
    letterSpacing: 0.2,
  },
  scanButton: {
    width: "100%",
    marginBottom: 16, // More space between buttons
    height: 56, // Taller buttons for better touch targets
    borderRadius: 12, // Rounded corners
    elevation: 3, // Android shadow
  },
  cancelButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
  },
});