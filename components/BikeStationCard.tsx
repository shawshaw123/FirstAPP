import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from "react-native";
import { BikeStation } from "@/components";
import { useTheme } from "@/components/theme-context";
import { ChevronRight, Bike, MapPin } from "lucide-react-native";

interface BikeStationCardProps {
  station: BikeStation;
  onPress: () => void;
}

export default function BikeStationCard({ station, onPress }: BikeStationCardProps) {
  const { colors } = useTheme();

  // Determine availability status color
  const getAvailabilityColor = () => {
    if (station.availableBikes === 0) return "#FF5252"; // Red for no bikes
    if (station.availableBikes < 3) return "#FFC107"; // Yellow for low availability
    return "#00C853"; // Green for good availability
  };

  return (
      <TouchableOpacity
          style={[styles.container, { backgroundColor: colors.cardBackground }]}
          onPress={onPress}
          activeOpacity={0.7}
      >
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "10" }]}>
            <Bike size={20} color={colors.primary} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.stationName, { color: colors.text }]}>{station.name}</Text>
            <View style={styles.detailsContainer}>
              <View style={styles.availabilityContainer}>
                <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor() }]} />
                <Text style={[styles.availabilityText, { color: colors.textSecondary }]}>
                  {station.availableBikes} bikes available
                </Text>
              </View>
              <View style={styles.distanceContainer}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text style={[styles.distanceText, { color: colors.textSecondary }]}>
                  {station.distance} km
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.rightContent}>
          <ChevronRight size={20} color={colors.textSecondary} />
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
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: Platform.OS === 'ios' ? "#000" : "transparent",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  textContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  rightContent: {
    padding: 8,
  },
});