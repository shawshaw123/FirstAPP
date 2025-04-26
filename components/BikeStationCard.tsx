import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BikeStation } from "@/components";
import { useTheme } from "@/components/theme-context";
import { ChevronRight, Bike } from "lucide-react-native";

interface BikeStationCardProps {
  station: BikeStation;
  onPress: () => void;
}

export default function BikeStationCard({ station, onPress }: BikeStationCardProps) {
  const { colors } = useTheme();

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
            <Text style={[styles.availabilityText, { color: colors.textSecondary }]}>
              {station.availableBikes} bikes available
            </Text>
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
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 14,
  },
  rightContent: {
    padding: 8,
  },
});