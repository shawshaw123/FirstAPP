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
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/theme-context";
import TabBar from "@/components/TabBar";
import Button from "@/components/Button";
import { useAuthStore } from "@/components/auth-store";
import { User, Info, FileText, LogOut, CreditCard, Settings, Award, List, Activity } from "lucide-react-native";
import GradientCard from "@/components/GradientCard";
import LogViewer from "@/components/LogViewer";
import TaskMonitor from "@/components/TaskMonitor";
import { useLogging } from "@/hooks/use-logging";
import { useConcurrentOperations } from "@/hooks/use-concurrent-operations";
import { TaskPriority } from "@/components/concurrent-queue";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, logout, addFunds, clearError } = useAuthStore();
  const { colors } = useTheme();
  const { logInfo, logError } = useLogging();
  const { executeConcurrently, stats } = useConcurrentOperations();

  // State for add funds modal
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  // State for log viewer and task monitor
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [showTaskMonitor, setShowTaskMonitor] = useState(false);

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
      // @ts-ignore
      Alert.alert(
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
          ],
      );
    } else {
      // For Android and web, show a modal
      setShowAddFundsModal(true);
    }
  };

  const handleAddFundsConfirm = () => {
    const numAmount = parseFloat(fundAmount);
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

      setShowAddFundsModal(false);
      setFundAmount("");
      Alert.alert("Success", `₱${numAmount} added to your wallet.`);
    } else {
      Alert.alert("Error", "Please enter a valid amount.");
    }
  };

  // Run a demo of concurrent operations
  const runConcurrentDemo = () => {
    Alert.alert(
        "Run Concurrent Demo",
        "This will run multiple operations simultaneously to demonstrate concurrent processing. Check the Task Monitor to see the results.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Run Demo",
            onPress: () => {
              logInfo("Running concurrent operations demo");

              // Show the task monitor
              setShowTaskMonitor(true);

              // Run multiple operations with different priorities
              for (let i = 0; i < 5; i++) {
                // High priority task - fast
                executeConcurrently(
                    async () => {
                      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
                      return { result: `High priority task ${i} completed` };
                    },
                    {
                      priority: TaskPriority.HIGH,
                      description: `High priority task ${i}`
                    }
                );

                // Normal priority task - medium
                executeConcurrently(
                    async () => {
                      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
                      return { result: `Normal priority task ${i} completed` };
                    },
                    {
                      priority: TaskPriority.NORMAL,
                      description: `Normal priority task ${i}`
                    }
                );

                // Low priority task - slow
                executeConcurrently(
                    async () => {
                      await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));
                      return { result: `Low priority task ${i} completed` };
                    },
                    {
                      priority: TaskPriority.LOW,
                      description: `Low priority task ${i}`
                    }
                );
              }

              // Add a failing task
              executeConcurrently(
                  async () => {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    throw new Error("This task is designed to fail");
                  },
                  {
                    priority: TaskPriority.NORMAL,
                    description: "Failing task"
                  }
              );
            }
          }
        ]
    );
  };

  // Share app logs
  const shareAppLogs = async () => {
    try {
      const { exportLogs } = useLogging();
      const logsText = exportLogs();

      await Share.share({
        message: logsText,
        title: 'Forda GO App Logs',
      });

      logInfo("App logs shared");
    } catch (error) {
      logError("Failed to share app logs", error);
      Alert.alert("Error", "Failed to share app logs");
    }
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

          <View style={styles.profileSection}>
            <View style={[styles.avatarContainer, { backgroundColor: "#00C85320" }]}>
              <User size={40} color="#00C853" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: "#FFFFFF" }]}>{user?.name}</Text>
              <Text style={[styles.email, { color: "#AAAAAA" }]}>{user?.email}</Text>
            </View>
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

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <User size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Personal Information</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <CreditCard size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Payment Methods</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Award size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Achievements</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: "#FFFFFF" }]}>System</Text>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={() => setShowLogViewer(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <List size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>View Logs</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={() => setShowTaskMonitor(true)}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Activity size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Task Monitor</Text>
                {stats.running > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{stats.running}</Text>
                    </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={runConcurrentDemo}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Activity size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Run Concurrent Demo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: "#121212" }]}
                onPress={shareAppLogs}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <FileText size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Share App Logs</Text>
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

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <Info size={20} color="#00C853" />
                </View>
                <Text style={[styles.menuItemText, { color: "#FFFFFF" }]}>Help & Support</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: "#121212" }]}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: "#00C85320" }]}>
                  <FileText size={20} color="#00C853" />
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

        {/* Add Funds Modal for Android and Web */}
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

        {/* Log Viewer */}
        <LogViewer
            visible={showLogViewer}
            onClose={() => setShowLogViewer(false)}
        />

        {/* Task Monitor */}
        <TaskMonitor
            visible={showTaskMonitor}
            onClose={() => setShowTaskMonitor(false)}
        />

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
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  walletCard: {
    marginBottom: 24,
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
  badgeContainer: {
    backgroundColor: "#00C853",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
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
});