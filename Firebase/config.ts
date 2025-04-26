
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Changed from getFirestore
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "protoapp-d9b2a.firebaseapp.com",
  databaseURL: "https://protoapp-d9b2a-default-rtdb.firebaseio.com/",
  projectId: "protoapp-d9b2a",
  storageBucket: "protoapp-d9b2a.appspot.com",
  messagingSenderId: "140770972837",
  appId: "1:140770972837:web:478f077e90e2a989824089"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); // Changed from getFirestore
const storage = getStorage(app);

export { app, auth, db, storage };
export const usingMockFirebase = false;