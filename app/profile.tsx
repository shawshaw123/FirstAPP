import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  TextInput,
  Modal,
  Share,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import { useAuthStore } from "@/store/auth-store";
import { User, Info, FileText, LogOut, CreditCard, Settings, HelpCircle, Shield, ExternalLink } from "lucide-react-native";
import GradientCard from "@/components/GradientCard";
import { useLogging } from "@/hooks/use-logging";
import { useConcurrentOperations } from "@/hooks/use-concurrent-operations";
import { TaskPriority } from "@/services/concurrent-queue";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, logout, addFunds, clearError } = useAuthStore();
  const { colors } = useTheme();
  const { logInfo, logError } = useLogging();
  const { executeConcurrently } = useConcurrentOperations();

  // State for modals
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [showHelpSupportModal, setShowHelpSupportModal] = useState(false);
  const [showTermsPrivacyModal, setShowTermsPrivacyModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

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

    // Log screen view
    logInfo("Profile screen viewed", { userId: user?.id });
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      clearError();
    }
  }, [error]);

  const handleLogout = async () => {
    Alert.alert(
        "Logout",
        "Are you sure you want to logout?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Logout",
            onPress: async () => {
              logInfo("User logging out", { userId: user?.id });
              await logout();
            }
          }
        ]
    );
  };

  const handleAddFunds = () => {
    // For iOS, we can use Alert.prompt
    if (Platform.OS === 'ios') {
      Alert.prompt(
          "Add Funds",
          "Enter amount to add to your wallet:",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Add",
              onPress: (amount) => {
                if (amount) {
                  const numAmount = parseFloat(amount);
                  if (!isNaN(numAmount) && numAmount > 0) {
                    // Use concurrent operations for adding funds
                    executeConcurrently(
                        async () => {
                          await addFunds(numAmount);
                          return { amount: numAmount };
                        },
                        {
                          priority: TaskPriority.HIGH,
                          description: "Add funds to wallet"
                        }
                    );

                    logInfo("Funds added to wallet", {
                      userId: user?.id,
                      amount: numAmount,
                      newBalance: (user?.walletBalance || 0) + numAmount
                    });

                    Alert.alert("Success", `₱${numAmount} added to your wallet.`);
                  } else {
                    Alert.alert("Error", "Please enter a valid amount.");
                  }
                }
              }
            }
          ]
      );
    } else {
      // For Android and web, show a modal
      setShowAddFundsModal(true);
    }
  };

  const handleAddFundsConfirm = async () => {
    const numAmount = parseFloat(fundAmount);
    if (!isNaN(numAmount) && numAmount > 0) {
      try {
        await addFunds(numAmount);

        logInfo("Funds added to wallet", {
          userId: user?.id,
          amount: numAmount,
          newBalance: (user?.walletBalance || 0) + numAmount
        });

        setShowAddFundsModal(false);
        setFundAmount("");
        Alert.alert("Success", `₱${numAmount} added to your wallet.`);
      } catch (error) {
        Alert.alert("Error", "Failed to add funds. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please enter a valid amount.");
    }
  };

  const handlePaymentMethodsPress = () => {
    setShowPaymentMethodsModal(true);
  };

  const handleHelpSupportPress = () => {
    setShowHelpSupportModal(true);
  };

  const handleTermsPrivacyPress = () => {
    setShowTermsPrivacyModal(true);
  };

  const handleSelectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method);
    setTimeout(() => {
      setShowPaymentMethodsModal(false);
      Alert.alert("Payment Method", `${method} has been selected as your payment method.`);
    }, 500);
  };

  const handleConnectGCash = () => {
    Alert.alert(
        "Connect GCash",
        "You'll be redirected to GCash to complete the connection process.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              // In a real app, this would redirect to GCash
              Alert.alert("GCash Connection", "GCash account successfully connected!");
              setSelectedPaymentMethod("GCash");
            }
          }
        ]
    );
  };

  const handleConnectPayMaya = () => {
    Alert.alert(
        "Connect PayMaya",
        "You'll be redirected to PayMaya to complete the connection process.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {
              // In a real app, this would redirect to PayMaya
              Alert.alert("PayMaya Connection", "PayMaya account successfully connected!");
              setSelectedPaymentMethod("PayMaya");
            }
          }
        ]
    );
  };

  const handleOpenExternalLink = (url: string, title: string) => {
    Alert.alert(
        "Open External Link",
        `Would you like to open ${title}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open",
            onPress: () => {
              Linking.openURL(url).catch(() => {
                Alert.alert("Error", "Could not open the link");
              });
            }
          }
        ]
    );
  };

  if (isLoading) {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00C853" />
            <Text style={[styles.loadingText, { color: "#FFFFFF" }]}>Loading profile...</Text>
          </View>
          <TabBar />
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#000000" }]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: "#FFFFFF" }]}>Profile</Text>
          </View>

          <GradientCard style={styles.walletCard} intensity="medium">
            <View style={styles.walletHeader}>
              <Text style={[styles.walletTitle, { color: "#FFFFFF" }]}>Wallet Balance</Text>
              <CreditCard size={24} color="#00C853" />
            </View>
            <Text style={[styles.walletBalance, { color: "#FFFFFF" }]}>₱{user?.walletBalance.toLocaleString()}</Text>
            <Button
                title="Add Funds"
                onPress={handleAddFunds}
                variant="secondary"
                size="small"
                style={styles.addFundsButton}
            />
          </GradientCard>

          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>Account</Text>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={handlePaymentMethodsPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <CreditCard size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Payment Methods</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>Settings</Text>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Settings size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>App Settings</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={handleHelpSupportPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <HelpCircle size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Help & Support</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={handleTermsPrivacyPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Shield size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Terms & Privacy</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
              icon={<LogOut size={20} color="#FFFFFF" />}
              iconPosition="left"
          />
        </ScrollView>

        {/* Add Funds Modal */}
        <Modal
            visible={showAddFundsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowAddFundsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: "#121212" }]}>
              <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Add Funds</Text>
              <Text style={[styles.modalSubtitle, { color: "#AAAAAA" }]}>Enter amount to add to your wallet:</Text>

              <TextInput
                  style={[styles.amountInput, { color: "#FFFFFF", borderColor: "#333333" }]}
                  value={fundAmount}
                  onChangeText={setFundAmount}
                  placeholder="Enter amount"
                  placeholderTextColor="#777777"
                  keyboardType="numeric"
                  autoFocus
              />

              <View style={styles.modalButtons}>
                <Button
                    title="Cancel"
                    onPress={() => {
                      setShowAddFundsModal(false);
                      setFundAmount("");
                    }}
                    variant="outline"
                    style={styles.modalButton}
                />
                <Button
                    title="Add Funds"
                    onPress={handleAddFundsConfirm}
                    variant="primary"
                    style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>

        {/* Payment Methods Modal */}
        <Modal
            visible={showPaymentMethodsModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPaymentMethodsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: "#121212", width: "90%" }]}>
              <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Payment Methods</Text>
              <Text style={[styles.modalSubtitle, { color: "#AAAAAA" }]}>Select your preferred payment method:</Text>

              <View style={styles.paymentMethodsContainer}>
                <TouchableOpacity
                    style={[
                      styles.paymentMethodItem,
                      selectedPaymentMethod === "GCash" && styles.selectedPaymentMethod
                    ]}
                    onPress={() => handleConnectGCash()}
                >
                  <View style={styles.paymentMethodContent}>
                    <View style={[styles.paymentIconContainer, { backgroundColor: "#0073FF20" }]}>
                      <Text style={styles.paymentIconText}>G</Text>
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[styles.paymentMethodName, { color: "#FFFFFF" }]}>GCash</Text>
                      <Text style={[styles.paymentMethodDesc, { color: "#AAAAAA" }]}>
                        {selectedPaymentMethod === "GCash"
                            ? "Connected"
                            : "Connect your GCash account"}
                      </Text>
                    </View>
                  </View>

                  {selectedPaymentMethod === "GCash" && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedText}>Connected</Text>
                      </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                      styles.paymentMethodItem,
                      selectedPaymentMethod === "PayMaya" && styles.selectedPaymentMethod
                    ]}
                    onPress={() => handleConnectPayMaya()}
                >
                  <View style={styles.paymentMethodContent}>
                    <View style={[styles.paymentIconContainer, { backgroundColor: "#7B1FA220" }]}>
                      <Text style={styles.paymentIconText}>P</Text>
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[styles.paymentMethodName, { color: "#FFFFFF" }]}>PayMaya</Text>
                      <Text style={[styles.paymentMethodDesc, { color: "#AAAAAA" }]}>
                        {selectedPaymentMethod === "PayMaya"
                            ? "Connected"
                            : "Connect your PayMaya account"}
                      </Text>
                    </View>
                  </View>

                  {selectedPaymentMethod === "PayMaya" && (
                      <View style={styles.connectedBadge}>
                        <Text style={styles.connectedText}>Connected</Text>
                      </View>
                  )}
                </TouchableOpacity>

                <View style={styles.paymentInfoBox}>
                  <Text style={[styles.paymentInfoText, { color: "#AAAAAA" }]}>
                    Connect your preferred payment method to easily add funds to your wallet. Your payment information is securely stored and processed.
                  </Text>
                </View>
              </View>

              <Button
                  title="Close"
                  onPress={() => setShowPaymentMethodsModal(false)}
                  variant="outline"
                  style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* Help & Support Modal */}
        <Modal
            visible={showHelpSupportModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowHelpSupportModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: "#121212", width: "90%" }]}>
              <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Help & Support</Text>

              <ScrollView style={styles.helpContentScroll}>
                <View style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: "#FFFFFF" }]}>Frequently Asked Questions</Text>

                  <View style={styles.faqItem}>
                    <Text style={[styles.faqQuestion, { color: "#FFFFFF" }]}>How do I rent a bike?</Text>
                    <Text style={[styles.faqAnswer, { color: "#AAAAAA" }]}>
                      To rent a bike, locate a station on the map, select an available bike, and scan the QR code. The bike will unlock automatically.
                    </Text>
                  </View>

                  <View style={styles.faqItem}>
                    <Text style={[styles.faqQuestion, { color: "#FFFFFF" }]}>How do I end my rental?</Text>
                    <Text style={[styles.faqAnswer, { color: "#AAAAAA" }]}>
                      Return the bike to any station and lock it securely. The app will detect when the bike is returned and end your rental automatically.
                    </Text>
                  </View>

                  <View style={styles.faqItem}>
                    <Text style={[styles.faqQuestion, { color: "#FFFFFF" }]}>How much does it cost?</Text>
                    <Text style={[styles.faqAnswer, { color: "#AAAAAA" }]}>
                      Rental rates start at ₱20 for regular bikes and ₱30 for electric bikes per hour. You can view the exact price on each bike's details.
                    </Text>
                  </View>

                  <View style={styles.faqItem}>
                    <Text style={[styles.faqQuestion, { color: "#FFFFFF" }]}>What if the bike gets damaged?</Text>
                    <Text style={[styles.faqAnswer, { color: "#AAAAAA" }]}>
                      If you notice any damage before renting, please report it through the app. If damage occurs during your rental, contact our support team immediately.
                    </Text>
                  </View>

                  <View style={styles.faqItem}>
                    <Text style={[styles.faqQuestion, { color: "#FFFFFF" }]}>Can I reserve a bike in advance?</Text>
                    <Text style={[styles.faqAnswer, { color: "#AAAAAA" }]}>
                      Currently, we don't support bike reservations. Bikes are available on a first-come, first-served basis.
                    </Text>
                  </View>
                </View>

                <View style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: "#FFFFFF" }]}>Contact Us</Text>
                  <Text style={[styles.contactText, { color: "#AAAAAA" }]}>
                    Email: support@bikeshare.com{"\n"}
                    Phone: +63 (2) 8123 4567{"\n"}
                    Hours: Monday to Friday, 8:00 AM to 6:00 PM
                  </Text>

                  <View style={styles.contactButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: "#00C85320" }]}
                        onPress={() => handleOpenExternalLink("mailto:support@bikeshare.com", "Email Support")}
                    >
                      <Text style={[styles.contactButtonText, { color: "#00C853" }]}>Email Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactButton, { backgroundColor: "#7C4DFF20" }]}
                        onPress={() => handleOpenExternalLink("tel:+6328123456", "Call Support")}
                    >
                      <Text style={[styles.contactButtonText, { color: "#7C4DFF" }]}>Call Support</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: "#FFFFFF" }]}>Report an Issue</Text>
                  <Text style={[styles.contactText, { color: "#AAAAAA" }]}>
                    If you're experiencing any issues with the app or a bike, please report it to our support team. We'll address it as soon as possible.
                  </Text>

                  <TouchableOpacity
                      style={[styles.reportButton, { backgroundColor: "#FF525220" }]}
                      onPress={() => Alert.alert("Report Issue", "This feature will be available soon.")}
                  >
                    <Text style={[styles.reportButtonText, { color: "#FF5252" }]}>Report an Issue</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <Button
                  title="Close"
                  onPress={() => setShowHelpSupportModal(false)}
                  variant="outline"
                  style={{ marginTop: 16 }}
              />
            </View>
          </View>
        </Modal>

        {/* Terms & Privacy Modal */}
        <Modal
            visible={showTermsPrivacyModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTermsPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: "#121212", width: "90%" }]}>
              <Text style={[styles.modalTitle, { color: "#FFFFFF" }]}>Terms & Privacy</Text>

              <ScrollView style={styles.termsContentScroll}>
                <View style={styles.termsSection}>
                  <Text style={[styles.termsSectionTitle, { color: "#FFFFFF" }]}>Terms of Service</Text>
                  <Text style={[styles.termsText, { color: "#AAAAAA" }]}>
                    By using our bike sharing service, you agree to the following terms:{"\n\n"}

                    1. You must be at least 18 years old to use our service.{"\n\n"}

                    2. You are responsible for any damage to the bike during your rental period.{"\n\n"}

                    3. Bikes must be returned to designated stations only.{"\n\n"}

                    4. Helmets are recommended for all riders.{"\n\n"}

                    5. We reserve the right to charge your account for any damages or unreturned bikes.{"\n\n"}

                    6. Service availability may vary based on weather conditions and maintenance schedules.{"\n\n"}

                    7. Rental fees are calculated based on the duration of your rental and the type of bike.{"\n\n"}

                    8. You agree to follow all traffic laws and regulations while using our bikes.{"\n\n"}

                    9. We are not responsible for any injuries or accidents that occur during your rental period.{"\n\n"}

                    10. We reserve the right to terminate your account if you violate these terms.
                  </Text>
                </View>

                <View style={styles.termsSection}>
                  <Text style={[styles.termsSectionTitle, { color: "#FFFFFF" }]}>Privacy Policy</Text>
                  <Text style={[styles.termsText, { color: "#AAAAAA" }]}>
                    We collect the following information:{"\n\n"}

                    1. Personal information (name, email, student ID){"\n\n"}

                    2. Location data during bike rentals{"\n\n"}

                    3. Payment information{"\n\n"}

                    4. Usage statistics{"\n\n"}

                    This information is used to provide and improve our service, process payments, and ensure the security of our bike fleet. We do not sell your personal information to third parties.{"\n\n"}

                    You can request access to or deletion of your data by contacting our support team.{"\n\n"}

                    We use industry-standard security measures to protect your data, but no method of transmission over the internet is 100% secure.{"\n\n"}

                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
                  </Text>
                </View>

                <View style={styles.termsSection}>
                  <Text style={[styles.termsSectionTitle, { color: "#FFFFFF" }]}>Cookie Policy</Text>
                  <Text style={[styles.termsText, { color: "#AAAAAA" }]}>
                    We use cookies to enhance your experience on our app. Cookies are small text files that are stored on your device when you use our app.{"\n\n"}

                    We use cookies to:{"\n\n"}

                    1. Remember your login information{"\n\n"}

                    2. Understand how you use our app{"\n\n"}

                    3. Improve our app based on your usage{"\n\n"}

                    You can choose to disable cookies in your browser settings, but this may affect your experience using our app.
                  </Text>
                </View>

                <View style={styles.termsButtonsContainer}>
                  <TouchableOpacity
                      style={styles.termsButton}
                      onPress={() => handleOpenExternalLink("https://example.com/terms", "Terms of Service")}
                  >
                    <Text style={[styles.termsButtonText, { color: "#00C853" }]}>Full Terms of Service</Text>
                    <ExternalLink size={16} color="#00C853" />
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.termsButton}
                      onPress={() => handleOpenExternalLink("https://example.com/privacy", "Privacy Policy")}
                  >
                    <Text style={[styles.termsButtonText, { color: "#00C853" }]}>Full Privacy Policy</Text>
                    <ExternalLink size={16} color="#00C853" />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <Button
                  title="Close"
                  onPress={() => setShowTermsPrivacyModal(false)}
                  variant="outline"
                  style={{ marginTop: 16 }}
              />
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  walletCard: {
    marginVertical: 24,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
  },
  addFundsButton: {
    alignSelf: "flex-start",
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    flex: 1,
  },
  logoutButton: {
    marginBottom: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
  },
  amountInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  // Payment methods styles
  paymentMethodsContainer: {
    width: "100%",
    marginBottom: 16,
  },
  paymentMethodItem: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },
  selectedPaymentMethod: {
    borderColor: "#00C853",
    borderWidth: 2,
  },
  paymentMethodContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentIconText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 14,
  },
  connectedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#00C85320",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  connectedText: {
    color: "#00C853",
    fontSize: 12,
    fontWeight: "bold",
  },
  paymentInfoBox: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00C853",
  },
  paymentInfoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Help & Support styles
  helpContentScroll: {
    width: "100%",
    maxHeight: 400,
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  contactButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  contactButtonText: {
    fontWeight: "600",
  },
  reportButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  reportButtonText: {
    fontWeight: "600",
  },
  // Terms & Privacy styles
  termsContentScroll: {
    width: "100%",
    maxHeight: 400,
  },
  termsSection: {
    marginBottom: 24,
  },
  termsSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  termsButtonsContainer: {
    marginBottom: 24,
  },
  termsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  termsButtonText: {
    fontWeight: "600",
    marginRight: 8,
  },
});