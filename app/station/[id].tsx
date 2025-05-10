import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import { BikeStation, Bike } from "@/components";
import BikeCard from "@/components/BikeCard";
import Button from "@/components/Button";
import { useStationStore } from "@/store/station-store";
import { useAuthStore } from "@/store/auth-store";
import { Bike as BikeIcon, MapPin, ArrowLeft, Navigation, Clock } from "lucide-react-native";

export default function StationDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useAuthStore();
    const {
        selectedStation,
        stationBikes,
        isLoading,
        error,
        loadStationById,
        loadBikesByStation
    } = useStationStore();

    useEffect(() => {
        if (id) {
            loadStationById(id);
            loadBikesByStation(id);
        }
    }, [id]);

    const handleBikePress = (bike: Bike) => {
        if (user && user.walletBalance < bike.pricePerHour) {
            Alert.alert(
                "Insufficient Balance",
                "You don't have enough balance to rent this bike. Please add funds to your wallet.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Add Funds",
                        onPress: () => router.push("/profile")
                    }
                ]
            );
            return;
        }

        router.push({
            pathname: "/scan",
            params: { bikeId: bike.id, stationId: id }
        });
    };

    const handleBack = () => {
        router.back();
    };

    const handleGetDirections = () => {
        if (Platform.OS === "web") {
            Alert.alert("Directions", "This feature is not available on web.");
            return;
        }

        Alert.alert(
            "Get Directions",
            "Would you like to open maps with directions to this station?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Open Maps", onPress: () => console.log("Opening maps...") }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>Loading station details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !selectedStation) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: colors.error }]}>{error || "Station not found"}</Text>
                    <Button
                        title="Go Back"
                        onPress={handleBack}
                        style={styles.backButton}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.stationInfo}>
                <Text style={[styles.stationName, { color: colors.text }]}>{selectedStation.name}</Text>

                <View style={[styles.stationImageContainer, { backgroundColor: colors.cardBackgroundAlt }]}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { color: '#00C853' }]}>FORDA GO</Text>
                    </View>
                    <Image
                        style={styles.stationImage}
                        resizeMode="cover"
                    />
                    <View style={styles.stationImageOverlay}>
                        <TouchableOpacity
                            style={styles.directionsButton}
                            onPress={handleGetDirections}
                        >
                            <Navigation size={20} color="#FFFFFF" />
                            <Text style={styles.directionsText}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.statsContainer, { backgroundColor: colors.cardBackground }]}>
                    <View style={styles.statItem}>
                        <BikeIcon size={20} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{selectedStation.availableBikes}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available bikes</Text>
                    </View>

                    <View style={styles.statItem}>
                        <MapPin size={20} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{selectedStation.emptySlots}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Empty slots</Text>
                    </View>

                    <View style={styles.statItem}>
                        <Clock size={20} color={colors.primary} />
                        <Text style={[styles.statValue, { color: colors.text }]}>{selectedStation.distance}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>km away</Text>
                    </View>
                </View>
            </View>

            <View style={styles.bikesContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Available bikes</Text>

                <FlatList
                    data={stationBikes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BikeCard bike={item} onPress={() => handleBikePress(item)} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No bikes available at this station</Text>
                        </View>
                    }
                    contentContainerStyle={styles.bikesList}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    stationInfo: {
        padding: 16,
    },
    stationName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    stationImageContainer: {
        height: 180,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: '#1A1A1A',
    },
    logoContainer: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        zIndex: 1,
    },
    logoText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    stationImage: {
        width: "100%",
        height: "100%",
        opacity: 0.7,
    },
    stationImageOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    directionsButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 200, 83, 0.8)",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: "flex-end",
    },
    directionsText: {
        color: "#FFFFFF",
        marginLeft: 8,
        fontWeight: "600",
    },
    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
        textAlign: "center",
    },
    bikesContainer: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    bikesList: {
        paddingBottom: 24,
    },
    emptyContainer: {
        padding: 24,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        textAlign: "center",
    },
});