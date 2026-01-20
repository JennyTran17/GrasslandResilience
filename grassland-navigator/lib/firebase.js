import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demokey",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demokey",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demokey",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demokey",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

let app, auth, db;

try {
  // Check if required env vars are present
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn("⚠️ Firebase env variables not found. Using demo config.");
  }

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  // Auto sign-in anonymously for demo purposes
  signInAnonymously(auth).catch(err => {
    console.warn("⚠️ Anonymous auth failed:", err.message);
  });
  
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  // Create mock objects to prevent crashes
  auth = { currentUser: null };
  db = null;
}

export { auth, db, signInAnonymously, onAuthStateChanged };