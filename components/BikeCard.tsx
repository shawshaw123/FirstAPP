import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Bike } from "@/components";
import { useTheme } from "@/components/theme-context";
import { Bike as BikeIcon, Battery, Shield, Zap } from "lucide-react-native";

interface BikeCardProps {
  bike: Bike;
  onPress: () => void;
}

export default function BikeCard({ bike, onPress }: BikeCardProps) {
  const { colors } = useTheme();

  // Get battery color based on level
  const getBatteryColor = () => {
    if (bike.batteryLevel > 70) return "#4CAF50";
    if (bike.batteryLevel > 30) return "#FFC107";
    return "#FF5252";
  };

  return (
      <TouchableOpacity
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          onPress={onPress}
          activeOpacity={0.7}
      >
        <View style={styles.leftContent}>
          <View style={[styles.bikeImageContainer, { backgroundColor: colors.cardBackgroundAlt }]}>
            {bike.isElectric ? (
                <Zap size={24} color={colors.primary} />
            ) : (
                <BikeIcon size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.bikeInfo}>
            <Text style={[styles.bikeName, { color: colors.text }]}>{bike.name}</Text>
            <View style={styles.bikeDetails}>
              {bike.isElectric && (
                  <View style={styles.batteryContainer}>
                    <Battery size={14} color={getBatteryColor()} />
                    <Text style={[styles.batteryText, { color: colors.textSecondary }]}>
                      {bike.batteryLevel}%
                    </Text>
                  </View>
              )}
              {bike.isElectric ? (
                  <View style={styles.electricBadge}>
                    <Text style={styles.electricBadgeText}>Electric</Text>
                  </View>
              ) : (
                  <View style={styles.regularBadge}>
                    <Text style={styles.regularBadgeText}>Regular</Text>
                  </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.rightContent}>
          <Text style={[styles.rentalPrice, { color: colors.primary }]}>₱{bike.pricePerHour}/hr</Text>
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bikeImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bikeInfo: {
    flex: 1,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  bikeDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  batteryText: {
    fontSize: 12,
    marginLeft: 4,
  },
  electricBadge: {
    backgroundColor: "#7C4DFF20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  electricBadgeText: {
    color: "#7C4DFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  regularBadge: {
    backgroundColor: "#00C85320",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  regularBadgeText: {
    color: "#00C853",
    fontSize: 10,
    fontWeight: "bold",
  },
  rightContent: {
    alignItems: "flex-end",
  },
  rentalPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
});