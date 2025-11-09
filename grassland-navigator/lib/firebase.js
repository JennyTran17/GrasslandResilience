import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = globalThis.__firebase_config || {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
};

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed:", error.message);
  // Create mock auth object for development
  auth = {
    currentUser: { uid: 'demo-user' },
    onAuthStateChanged: (callback) => callback({ uid: 'demo-user' })
  };
  db = null;
}

export { auth, db, signInAnonymously, onAuthStateChanged };
