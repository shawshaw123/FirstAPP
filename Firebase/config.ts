
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { ref, get } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA13UpE5fDMnhXEH0_Px9TkZhBUkViQrf8",
  authDomain: "fordago-3739c.firebaseapp.com",
  databaseURL: "https://fordago-3739c-default-rtdb.firebaseio.com/",
  projectId: "fordago-3739c",
  storageBucket: "fordago-3739c.firebasestorage.app",
  messagingSenderId: "448653886821",
  appId: "1:448653886821:web:6e56c1d1784e32270dcd8c" // Changed from android to web
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export const usingMockFirebase = false;

// Test database connection
const testConnection = async () => {
  try {
    const testRef = ref(db, 'test');
    const snapshot = await get(testRef);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

testConnection();