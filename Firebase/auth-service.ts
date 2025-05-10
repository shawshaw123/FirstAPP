import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/components';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from './config';
import { 
  saveUserToDatabase, 
  getUserFromDatabase, 
  updateUserWalletBalance,
  initializeDatabase 
} from './database-service';

// Storage keys
const AUTH_USER_KEY = 'auth_user';

// Initialize database with test data if needed
initializeDatabase();

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
const saveUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Clear user from storage
const clearUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};

// Register a new user
export const registerUser = async (
    name: string,
    email: string,
    studentId: string,
    password: string
): Promise<User> => {
  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create user profile data
    const newUser: User = {
      id: uid,
      name,
      email,
      studentId,
      walletBalance: 1000, // Initial balance
    };

    // Save user to database
    await saveUserToDatabase(newUser);
    
    // Save to local storage
    await saveUser(newUser);

    return newUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    // Sign in with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    // Get user profile from database
    const user = await getUserFromDatabase(uid);
    
    if (!user) {
      throw new Error('User profile not found');
    }
    
    // Save to local storage
    await saveUser(user);
    
    return user;
  } catch (error) {
    console.error('Error logging in:', error);
    
    // For testing purposes, allow login with test account
    if (email === 'user@example.com' && password === 'password') {
      const testUser = await getUserFromDatabase('user1');
      if (testUser) {
        await saveUser(testUser);
        return testUser;
      }
    }
    
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    // Sign out from Firebase Authentication
    await signOut(auth);
    
    // Clear from storage
    await clearUser();
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Add funds to user wallet
export const addFundsToWallet = async (userId: string, amount: number): Promise<void> => {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  try {
    // Get current user
    const currentUser = await getUserFromDatabase(userId);

    if (!currentUser) {
      throw new Error('User not found');
    }

    // Update wallet balance
    const newBalance = currentUser.walletBalance + amount;
    
    // Update in database
    await updateUserWalletBalance(userId, newBalance);
    
    // Update local user data
    const updatedUser: User = {
      ...currentUser,
      walletBalance: newBalance
    };
    
    // Save updated user to local storage
    await saveUser(updatedUser);
    
  } catch (error) {
    console.error('Error adding funds to wallet:', error);
    throw error;
  }
};