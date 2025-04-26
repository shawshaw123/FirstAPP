// Mock Firebase configuration for development
// Replace with actual Firebase config when deploying to production

// This is a mock implementation that doesn't require actual Firebase credentials
const isMockMode = true; // Set to false when you have real Firebase credentials

// Your web app's Firebase configuration
// Replace with your actual Firebase config values when ready for production
const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "mock-auth-domain",
  projectId: "mock-project-id",
  storageBucket: "mock-storage-bucket",
  messagingSenderId: "mock-messaging-sender-id",
  appId: "mock-app-id"
};

// Mock Firebase implementations
const mockApp = { name: "[DEFAULT]" };
const mockAuth = {};
const mockDb = {};
const mockStorage = {};

// Export either real Firebase instances or mock instances
export const app = mockApp;
export const auth = mockAuth;
export const db = mockDb;
export const storage = mockStorage;

// Export a flag to indicate if we're using mock mode
export const usingMockFirebase = isMockMode;