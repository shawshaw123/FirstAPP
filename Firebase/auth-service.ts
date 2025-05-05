import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/components';


// Mock user data for development
const MOCK_USERS = [
  {
    email: 'user@example.com',
    password: 'password',
    profile: {
      id: 'user1',
      name: 'Test User',
      email: 'user@example.com',
      studentId: 'ST12345',
      walletBalance: 1000000,
    }
  }
];

// Storage keys
const AUTH_USER_KEY = 'auth_user';

// Get current user from storage
const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(AUTH_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Save user to storage
// This is using AsyncStorage, not Firebase
const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Registration just adds to local mock data
export const registerUser = async (
    name: string,
    email: string,
    studentId: string,
    password: string
): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if email already exists
  const existingUser = MOCK_USERS.find(user => user.email === email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create new user
  const newUser: User = {
    id: `user${Date.now()}`,
    name,
    email,
    studentId,
    walletBalance: 1000000, // Initial balance
  };

  // Add to mock users
  MOCK_USERS.push({
    email,
    password,
    profile: newUser
  });

  // Save to storage
  await saveUser(newUser);

  return newUser;
};

// Clear user from storage
const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Find user
  const user = MOCK_USERS.find(
      user => user.email === email && user.password === password
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Save to storage
  await saveUser(user.profile);

  return user.profile;
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Clear from storage
  await clearUser();
};

// Add funds to user wallet
export const addFundsToWallet = async (userId: string, amount: number): Promise<void> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get current user
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.id !== userId) {
    throw new Error('User not found');
  }

  // Update wallet balance
  const updatedUser: User = {
    ...currentUser,
    walletBalance: currentUser.walletBalance + amount
  };

  // Save updated user
  await saveUser(updatedUser);

  // Update mock user
  const mockUserIndex = MOCK_USERS.findIndex(user => user.profile.id === userId);
  if (mockUserIndex >= 0) {
    MOCK_USERS[mockUserIndex].profile = updatedUser;
  }
};