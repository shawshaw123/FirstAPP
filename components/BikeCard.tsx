import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Bike } from "@/components";
import Colors from "@/constants/Colors";
import { Bike as BikeIcon } from "lucide-react-native";

interface BikeCardProps {
  bike: Bike;
  onPress: () => void;
}

export default function BikeCard({ bike, onPress }: BikeCardProps) {
  return (
      <TouchableOpacity
          style={styles.container}
          onPress={onPress}
          activeOpacity={0.7}
      >
        <View style={styles.leftContent}>
          <BikeIcon size={20} color={Colors.dark.primary} />
          <Text style={styles.bikeName}>{bike.name}</Text>
        </View>
      </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bikeName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
});