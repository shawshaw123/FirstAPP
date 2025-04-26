import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRentalStore } from "@/components/rental-store";
import { useStationStore } from "@/components/station-store";
import { X } from "lucide-react-native";

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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
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
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    padding: 8,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.light.text,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.light.text,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.light.text,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.light.text,
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  scanDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  scanButton: {
    width: "100%",
    marginBottom: 12,
  },
  cancelButton: {
    width: "100%",
  },
});