import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions, CameraType, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRentalStore } from "@/store/rental-store";
import { useStationStore } from "@/store/station-store";
import { X, ZapOff, Zap } from "lucide-react-native";
import { useLogging } from "@/hooks/use-logging";

export default function ScanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bikeId?: string, stationId?: string }>();
  const { startRental, isLoading, error } = useRentalStore();
  const { selectedStation, stationBikes } = useStationStore();
  const { logInfo, logError } = useLogging();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [torch, setTorch] = useState(false);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);

  // If we have bikeId and stationId from params, we can skip the scanning
  const bikeId = params.bikeId;
  const stationId = params.stationId;

  useEffect(() => {
    if (bikeId && stationId) {
      // If we have params, process them directly
      handleQRCodeData(`fordago://rent?bikeId=${bikeId}&stationId=${stationId}`);
    }
  }, [bikeId, stationId]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      logError("Rental error", { error });
    }
  }, [error]);

  const handleCancel = () => {
    logInfo("Scanner cancelled");
    router.back();
  };

  const toggleTorch = () => {
    setTorch(!torch);
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    logInfo("QR code scanned", { data });

    // Process the QR code data
    handleQRCodeData(data);
  };

  const handleQRCodeData = async (data: string) => {
    try {
      setScanning(false);

      // Parse QR code data
      // Expected format: fordago://rent?bikeId=bike1&stationId=station1
      let actualBikeId = bikeId || "";
      let actualStationId = stationId || "";

      if (!bikeId || !stationId) {
        // Only try to parse if we don't have params
        if (data.startsWith("fordago://rent")) {
          const url = new URL(data.replace("fordago://", "https://"));
          const params = new URLSearchParams(url.search);
          actualBikeId = params.get("bikeId") || "";
          actualStationId = params.get("stationId") || "";
        } else {
          // Try to parse as direct data
          actualBikeId = data;
        }
      }

      if (!actualBikeId) {
        throw new Error("Invalid QR code. Could not find bike ID.");
      }

      // Find bike and station info
      let bikeName = "Forda Bike";
      let stationName = "Station";

      if (actualBikeId && stationBikes) {
        const bike = stationBikes.find(b => b.id === actualBikeId);
        if (bike) {
          bikeName = bike.name;
        }
      }

      if (actualStationId && selectedStation) {
        stationName = selectedStation.name;
      }

      logInfo("Starting rental", { bikeId: actualBikeId, stationId: actualStationId });
      await startRental(actualBikeId, bikeName, actualStationId, stationName);
      router.replace("/rentals");
    } catch (error) {
      console.error("Error processing QR code:", error);
      logError("QR code processing error", { error });
      Alert.alert("Error", "Failed to process QR code. Please try again.");
      setScanned(false);
      setScanning(true);
    }
  };

  // Handle camera permissions
  if (!permission) {
    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Loading camera...</Text>
          </View>
        </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to scan QR codes for bike rentals.
            </Text>
            <Button
                title="Grant Permission"
                onPress={requestPermission}
                style={styles.permissionButton}
            />
            <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelButton}
            />
          </View>
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cameraContainer}>
          {scanning ? (
              <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}

              >
                <View style={styles.overlay}>
                  <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                      <X size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={toggleTorch} style={styles.torchButton}>
                      {torch ? (
                          <Zap size={24} color="#FFFFFF" />
                      ) : (
                          <ZapOff size={24} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.scannerFrame}>
                    <View style={styles.cornerTopLeft} />
                    <View style={styles.cornerTopRight} />
                    <View style={styles.cornerBottomLeft} />
                    <View style={styles.cornerBottomRight} />
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.scanTitle}>Scan Forda GO QR Code</Text>
                    <Text style={styles.scanDescription}>
                      Point your camera at the QR code on the bike or docking station
                    </Text>

                    {scanned && (
                        <Button
                            title="Scan Again"
                            onPress={() => setScanned(false)}
                            style={styles.scanButton}
                        />
                    )}
                  </View>
                </View>
              </CameraView>
          ) : (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
                <Text style={styles.processingText}>Processing QR code...</Text>
              </View>
          )}
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  torchButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: "relative",
    marginTop: 40,
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.dark.primary,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.dark.primary,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: Colors.dark.primary,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: Colors.light.primary,
  },
  footer: {
    padding: 24,
    alignItems: "center",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  scanDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 32,
  },
  scanButton: {
    width: "100%",
    marginBottom: 12,
  },
  cancelButton: {
    width: "100%",
    marginTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 12,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
});