import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { RentalHistory } from "@/components";
import { useTheme } from "@/components/theme-context";
import { Bike, CheckCircle } from "lucide-react-native";

interface RentalHistoryCardProps {
  rental: RentalHistory;
  onPress?: () => void;
}

export default function RentalHistoryCard({ rental, onPress }: RentalHistoryCardProps) {
  const { colors } = useTheme();

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time to display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const startDate = formatDate(rental.startTime);
  const startTime = formatTime(rental.startTime);
  const endTime = formatTime(rental.endTime);

  return (
      <TouchableOpacity 
        style={[
          styles.container, 
          { backgroundColor: colors.cardBackground }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        <View style={styles.header}>
          <View style={styles.bikeInfo}>
            <Bike size={20} color={colors.primary} />
            <Text style={[styles.bikeName, { color: colors.text }]}>{rental.bikeName}</Text>
          </View>
          <CheckCircle size={20} color={colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.date, { color: colors.text }]}>{startDate}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {startTime} - {endTime} ({rental.duration})
          </Text>
          <Text style={[styles.route, { color: colors.textSecondary }]}>
            {rental.startStation} - {rental.endStation}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.distance, { color: colors.primary }]}>{rental.distance}km</Text>
            <Text style={[styles.cost, { color: colors.text }]}>₱{rental.cost}</Text>
          </View>
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: Platform.OS === 'ios' ? "#000" : "transparent",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bikeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: Platform.OS === 'android' ? 0.3 : 0,
  },
  content: {
    gap: 4,
  },
  date: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  time: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  route: {
    fontSize: 14,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  distance: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  cost: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});