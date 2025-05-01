import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import WalletBalance from "@/components/WalletBalance";
import { useAuthStore } from "@/store/auth-store";
import { useRentalStore } from "@/store/rental-store";
import { pricingPlans } from "@/components/stations";
import { Bike, Clock, QrCode, Award, Calendar, X, ChevronDown } from "lucide-react-native";
import { useTheme } from "@/components/theme-context";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { stations } from "@/components/stations";
import ConfettiEffect from "@/components/ConfettiEffect";
import { useBackgroundRental } from "@/hooks/use-background-rental";
import { useLogging } from "@/hooks/use-logging";
import { useConcurrentOperations } from "@/hooks/use-concurrent-operations";
import { TaskPriority } from "@/services/concurrent-queue";

export default function RentalsScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const {
    activeRental,
    isLoading,
    error,
    loadActiveRental,
    getCurrentCost,
    getRentalDuration,
    endRental
  } = useRentalStore();
  const { colors } = useTheme();
  const { logInfo, logError } = useLogging();
  const { executeConcurrently } = useConcurrentOperations();

  // Use background rental tracking
  const { isProcessing: isBackgroundProcessing } = useBackgroundRental();

  const [rentalDuration, setRentalDuration] = useState("00:00:00");
  const [currentCost, setCurrentCost] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Booking feature states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date());
  const [bookingTime, setBookingTime] = useState(new Date());
  const [bookingDuration, setBookingDuration] = useState("1 hour");
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // Calendar view states
  const [calendarView, setCalendarView] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Booking processing state
  const [isBookingProcessing, setIsBookingProcessing] = useState(false);

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

    // Load active rental with concurrent operations
    executeConcurrently(
        async () => {
          await loadActiveRental();
          return { success: true };
        },
        {
          priority: TaskPriority.HIGH,
          description: "Load active rental"
        }
    );

    // Log screen view
    logInfo("Rentals screen viewed", { userId: user?.id });
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      logError("Rental error", error);
      Alert.alert("Error", error);
    }
  }, [error]);

  useEffect(() => {
    if (activeRental) {
      // Update rental info every second
      const intervalId = setInterval(() => {
        setRentalDuration(getRentalDuration());
        setCurrentCost(getCurrentCost());
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [activeRental]);

  const handleScanQR = () => {
    logInfo("User navigating to scan QR code");
    router.push("/scan");
  };

  const handleViewAchievements = () => {
    logInfo("User navigating to achievements");
    router.push("/achievements");
  };

  const handleEndRental = async () => {
    Alert.alert(
        "End Rental",
        "Are you sure you want to end this rental?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "End Rental",
            onPress: async () => {
              logInfo("User ending rental", {
                rentalId: activeRental?.id,
                bikeId: activeRental?.bikeId,
                duration: rentalDuration,
                cost: currentCost
              });

              // Use concurrent operations to end rental
              executeConcurrently(
                  async () => {
                    try {
                      // In a real app, we would get the end station ID from the QR code
                      // For now, we'll use a mock station ID
                      const rentalHistory = await endRental("station2");
                      if (rentalHistory) {
                        setShowConfetti(true);
                        setTimeout(() => {
                          setShowConfetti(false);
                          Alert.alert(
                              "Rental Ended",
                              `Your rental has been ended. Total cost: ₱${rentalHistory.cost}`,
                              [{ text: "OK" }]
                          );
                        }, 3000);

                        return { success: true, rentalHistory };
                      }
                      return { success: false, error: "Failed to end rental" };
                    } catch (error) {
                      logError("Rental error", error);
                      Alert.alert("Error", "Failed to end rental. Please try again.");
                      return { success: false, error };
                    }
                  },
                  {
                    priority: TaskPriority.HIGH,
                    description: "End bike rental"
                  }
              );
            }
          }
        ]
    );
  };

  // Booking feature functions
  const handleBookNow = () => {
    logInfo("User opening booking modal");
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
    setCalendarView(false);
  };

  const handleConfirmBooking = () => {
    // Format date and time for display
    const formattedDate = bookingDate.toLocaleDateString();
    const formattedTime = bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    logInfo("User confirming bike booking", {
      userId: user?.id,
      stationId: selectedStation.id,
      stationName: selectedStation.name,
      date: formattedDate,
      time: formattedTime,
      duration: bookingDuration
    });

    // Use concurrent operations to process booking
    setIsBookingProcessing(true);

    // Execute the concurrent operation
    executeConcurrently(
        async () => {
          // Simulate booking process with network delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Calculate booking details
          const bookingDateTime = new Date(bookingDate);
          bookingDateTime.setHours(
              bookingTime.getHours(),
              bookingTime.getMinutes(),
              0,
              0
          );

          // Get price from selected duration
          const plan = pricingPlans.find(p => p.duration === bookingDuration);
          const price = plan?.price || 0;

          return {
            success: true,
            booking: {
              id: `booking_${Date.now()}`,
              stationId: selectedStation.id,
              stationName: selectedStation.name,
              dateTime: bookingDateTime.toISOString(),
              duration: bookingDuration,
              price
            }
          };
        },
        {
          priority: TaskPriority.NORMAL,
          description: "Process bike booking"
        }
    );

    // Show processing state for at least 2 seconds
    setTimeout(() => {
      setIsBookingProcessing(false);
      setShowBookingModal(false);
      setCalendarView(false);

      Alert.alert(
          "Booking Confirmed",
          `Your bike has been booked at ${selectedStation.name} on ${formattedDate} at ${formattedTime} for ${bookingDuration}.`,
          [{ text: "OK" }]
      );
    }, 2000);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBookingDate(selectedDate);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBookingTime(selectedTime);
    }
  };

  const toggleCalendarView = () => {
    setCalendarView(!calendarView);
  };

  const handleDayPress = (day: Date) => {
    setSelectedDay(day);
    setBookingDate(day);
    setCalendarView(false);
  };

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];

    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  if (isLoading && !activeRental) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: "#FFFFFF", fontWeight: "bold" }]}>BIKE RENT</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C853" />
            <Text style={[styles.loadingText, { color: "#FFFFFF" }]}>Loading rental information...</Text>
          </View>
          <TabBar />
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
        {showConfetti && <ConfettiEffect />}

        <View style={styles.header}>
          <Text style={[styles.title, { color: "#FFFFFF", fontWeight: "bold" }]}>BIKE RENT</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <WalletBalance />

          {activeRental ? (
              <View style={[styles.activeRentalContainer, { backgroundColor: "#121212" }]}>
                <Text style={[styles.sectionTitle, { color: "#AAAAAA", fontWeight: "500" }]}>Active Rental</Text>

                <View style={styles.bikeIconContainer}>
                  <Bike size={60} color="#00C853" />
                </View>

                <View style={[styles.timerContainer, { backgroundColor: "#00C85320" }]}>
                  <Clock size={20} color="#00C853" />
                  <Text style={[styles.timer, { color: "#FFFFFF", fontWeight: "bold" }]}>{rentalDuration}</Text>
                </View>

                <LinearGradient
                    colors={["#00C853", "#7C4DFF"] as const}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.costContainer}
                >
                  <Text style={[styles.costLabel, { color: "#FFFFFF", fontWeight: "500" }]}>Current cost:</Text>
                  <Text style={[styles.costValue, { color: "#FFFFFF", fontWeight: "bold" }]}>₱{currentCost}</Text>
                </LinearGradient>

                <View style={styles.rentalInfoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: "#AAAAAA" }]}>Bike id:</Text>
                    <Text style={[styles.infoValue, { color: "#FFFFFF", fontWeight: "500" }]}>{activeRental.bikeName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: "#AAAAAA" }]}>Start station:</Text>
                    <Text style={[styles.infoValue, { color: "#FFFFFF", fontWeight: "500" }]}>{activeRental.startStation}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: "#AAAAAA" }]}>Start time:</Text>
                    <Text style={[styles.infoValue, { color: "#FFFFFF", fontWeight: "500" }]}>
                      {new Date(activeRental.startTime).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>

                {isBackgroundProcessing && (
                    <View style={styles.backgroundProcessingContainer}>
                      <Text style={[styles.backgroundProcessingText, { color: "#00C853" }]}>
                        Background tracking active
                      </Text>
                    </View>
                )}

                <Button
                    title="End Rental"
                    onPress={handleEndRental}
                    variant="primary"
                    style={styles.endRentalButton}
                />
              </View>
          ) : (
              <View style={styles.noRentalContainer}>
                <View style={[styles.noRentalCard, { backgroundColor: "#121212" }]}>
                  <Text style={[styles.noRentalTitle, { color: "#FFFFFF", fontWeight: "bold" }]}>No Active Rental</Text>
                  <Text style={[styles.noRentalDescription, { color: "#AAAAAA" }]}>
                    You don't have any active bike rentals. Scan a QR code to start renting a bike or book in advance.
                  </Text>

                  <View style={styles.actionButtonsContainer}>
                    <Button
                        title="Scan QR Code"
                        onPress={handleScanQR}
                        variant="primary"
                        icon={<QrCode size={20} color="#fff" />}
                        iconPosition="left"
                        style={styles.actionButton}
                    />

                    <Button
                        title="Book Now"
                        onPress={handleBookNow}
                        variant="secondary"
                        icon={<Calendar size={20} color="#00C853" />}
                        iconPosition="left"
                        style={styles.actionButton}
                    />
                  </View>
                </View>

                <View style={[styles.pricingCard, { backgroundColor: "#121212" }]}>
                  <Text style={[styles.pricingTitle, { color: "#FFFFFF", fontWeight: "bold" }]}>Pricing Plans</Text>

                  {pricingPlans.map((plan, index) => (
                      <View key={index} style={[styles.pricingRow, { borderBottomColor: "#333333" }]}>
                        <Text style={[styles.pricingDuration, { color: "#FFFFFF" }]}>{plan.duration}</Text>
                        <Text style={[styles.pricingPrice, { color: "#00C853", fontWeight: "bold" }]}>
                          ₱{plan.price}{plan.perHour ? "/hour" : ""}
                        </Text>
                      </View>
                  ))}
                </View>

                <TouchableOpacity
                    style={[styles.achievementsCard, { backgroundColor: "#121212" }]}
                    onPress={handleViewAchievements}
                >
                  <View style={styles.achievementsHeader}>
                    <Text style={[styles.achievementsTitle, { color: "#FFFFFF", fontWeight: "bold" }]}>Achievements</Text>
                    <Award size={24} color="#00C853" />
                  </View>
                  <Text style={[styles.achievementsDescription, { color: "#AAAAAA" }]}>
                    Complete rides to unlock achievements and earn rewards!
                  </Text>
                </TouchableOpacity>
              </View>
          )}
        </ScrollView>

        {/* Booking Modal */}
        <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCloseBookingModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: "#121212" }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Book a Bike</Text>
                <TouchableOpacity onPress={handleCloseBookingModal}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={[styles.inputLabel, { color: "#AAAAAA" }]}>Select Station</Text>
                <TouchableOpacity
                    style={[styles.pickerButton, { backgroundColor: "#1A1A1A" }]}
                    onPress={() => setShowStationPicker(!showStationPicker)}
                >
                  <Text style={[styles.pickerButtonText, { color: "#FFFFFF" }]}>{selectedStation.name}</Text>
                  <ChevronDown size={20} color="#AAAAAA" />
                </TouchableOpacity>

                {showStationPicker && (
                    <View style={[styles.pickerOptions, { backgroundColor: "#1A1A1A" }]}>
                      {stations.map((station) => (
                          <TouchableOpacity
                              key={station.id}
                              style={styles.pickerOption}
                              onPress={() => {
                                setSelectedStation(station);
                                setShowStationPicker(false);
                              }}
                          >
                            <Text
                                style={[
                                  styles.pickerOptionText,
                                  {
                                    color: station.id === selectedStation.id ? "#00C853" : "#FFFFFF"
                                  }
                                ]}
                            >
                              {station.name}
                            </Text>
                          </TouchableOpacity>
                      ))}
                    </View>
                )}

                <Text style={[styles.inputLabel, { color: "#AAAAAA" }]}>Select Date</Text>
                <TouchableOpacity
                    style={[styles.pickerButton, { backgroundColor: "#1A1A1A" }]}
                    onPress={toggleCalendarView}
                >
                  <Text style={[styles.pickerButtonText, { color: "#FFFFFF" }]}>
                    {bookingDate.toLocaleDateString()}
                  </Text>
                  <Calendar size={20} color="#AAAAAA" />
                </TouchableOpacity>

                {calendarView && (
                    <View style={[styles.calendarContainer, { backgroundColor: "#1A1A1A" }]}>
                      <Text style={[styles.calendarMonth, { color: "#FFFFFF" }]}>{currentMonth}</Text>

                      <View style={styles.calendarWeekdays}>
                        {daysOfWeek.map((day, index) => (
                            <Text key={index} style={[styles.calendarWeekday, { color: "#AAAAAA" }]}>
                              {day}
                            </Text>
                        ))}
                      </View>

                      <View style={styles.calendarDays}>
                        {calendarDays.map((day, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                  styles.calendarDay,
                                  day && day.getTime() === selectedDay.getTime() && { backgroundColor: "#00C85330" },
                                  day && day.getTime() === new Date().setHours(0, 0, 0, 0) && { borderColor: "#00C853", borderWidth: 1 }
                                ]}
                                onPress={() => day && handleDayPress(day)}
                                disabled={!day || day < new Date(new Date().setHours(0, 0, 0, 0))}
                            >
                              {day ? (
                                  <Text
                                      style={[
                                        styles.calendarDayText,
                                        {
                                          color: day < new Date(new Date().setHours(0, 0, 0, 0))
                                              ? "#555555"
                                              : day.getTime() === selectedDay.getTime()
                                                  ? "#00C853"
                                                  : "#FFFFFF"
                                        }
                                      ]}
                                  >
                                    {day.getDate()}
                                  </Text>
                              ) : (
                                  <Text style={{ color: "transparent" }}>0</Text>
                              )}
                            </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                )}

                {showDatePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                        value={bookingDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}

                <Text style={[styles.inputLabel, { color: "#AAAAAA" }]}>Select Time</Text>
                <TouchableOpacity
                    style={[styles.pickerButton, { backgroundColor: "#1A1A1A" }]}
                    onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.pickerButtonText, { color: "#FFFFFF" }]}>
                    {bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Clock size={20} color="#AAAAAA" />
                </TouchableOpacity>

                {showTimePicker && Platform.OS !== 'web' && (
                    <DateTimePicker
                        value={bookingTime}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                    />
                )}

                <Text style={[styles.inputLabel, { color: "#AAAAAA" }]}>Duration</Text>
                <TouchableOpacity
                    style={[styles.pickerButton, { backgroundColor: "#1A1A1A" }]}
                    onPress={() => setShowDurationPicker(!showDurationPicker)}
                >
                  <Text style={[styles.pickerButtonText, { color: "#FFFFFF" }]}>{bookingDuration}</Text>
                  <ChevronDown size={20} color="#AAAAAA" />
                </TouchableOpacity>

                {showDurationPicker && (
                    <View style={[styles.pickerOptions, { backgroundColor: "#1A1A1A" }]}>
                      {pricingPlans.map((plan, index) => (
                          <TouchableOpacity
                              key={index}
                              style={styles.pickerOption}
                              onPress={() => {
                                setBookingDuration(plan.duration);
                                setShowDurationPicker(false);
                              }}
                          >
                            <Text
                                style={[
                                  styles.pickerOptionText,
                                  {
                                    color: plan.duration === bookingDuration ? "#00C853" : "#FFFFFF"
                                  }
                                ]}
                            >
                              {plan.duration} - ₱{plan.price}{plan.perHour ? "/hour" : ""}
                            </Text>
                          </TouchableOpacity>
                      ))}
                    </View>
                )}

                <View style={styles.bookingSummary}>
                  <Text style={[styles.summaryTitle, { color: "#FFFFFF" }]}>Booking Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#AAAAAA" }]}>Station:</Text>
                    <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>{selectedStation.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#AAAAAA" }]}>Date:</Text>
                    <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>{bookingDate.toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#AAAAAA" }]}>Time:</Text>
                    <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>
                      {bookingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#AAAAAA" }]}>Duration:</Text>
                    <Text style={[styles.summaryValue, { color: "#FFFFFF" }]}>{bookingDuration}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: "#AAAAAA" }]}>Price:</Text>
                    <Text style={[styles.summaryValue, { color: "#00C853", fontWeight: "bold" }]}>
                      ₱{pricingPlans.find(plan => plan.duration === bookingDuration)?.price || 0}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                    title="Confirm Booking"
                    onPress={handleConfirmBooking}
                    variant="primary"
                    style={styles.confirmButton}
                    isLoading={isBookingProcessing}
                />
                <Button
                    title="Cancel"
                    onPress={handleCloseBookingModal}
                    variant="outline"
                    style={styles.cancelButton}
                    disabled={isBookingProcessing}
                />
              </View>
            </View>
          </View>
        </Modal>

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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  activeRentalContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  bikeIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  timer: {
    fontSize: 24,
    marginLeft: 8,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 16,
  },
  costValue: {
    fontSize: 20,
  },
  rentalInfoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  backgroundProcessingContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  backgroundProcessingText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  endRentalButton: {
    marginTop: 8,
  },
  noRentalContainer: {
    gap: 16,
  },
  noRentalCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  noRentalTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  noRentalDescription: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  pricingCard: {
    borderRadius: 16,
    padding: 16,
  },
  pricingTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pricingDuration: {
    fontSize: 16,
  },
  pricingPrice: {
    fontSize: 16,
  },
  achievementsCard: {
    borderRadius: 16,
    padding: 16,
  },
  achievementsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  achievementsTitle: {
    fontSize: 18,
  },
  achievementsDescription: {
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerOptions: {
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 16,
    padding: 8,
  },
  pickerOption: {
    padding: 12,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  // Calendar styles
  calendarContainer: {
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 16,
    padding: 16,
  },
  calendarMonth: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  calendarWeekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarWeekday: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
  },
  calendarDays: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: 14,
  },
  bookingSummary: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },
  confirmButton: {
    marginBottom: 12,
  },
  cancelButton: {},
});