"use client";
import { useEffect, useState } from "react";
import { auth, signInAnonymously, onAuthStateChanged } from "@/lib/firebase";

export function useAuth() {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  console.log("Auth state initializing...");
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ Firebase user authenticated:", user.uid);
      setUserId(user.uid);
    } else {
      console.log("⚙️ Signing in anonymously...");
      signInAnonymously(auth)
        .then((cred) => {
          console.log("✅ Anonymous sign-in successful:", cred.user.uid);
          setUserId(cred.user.uid);
        })
        .catch((err) => {
          console.error("❌ Sign-in failed:", err);
          setError(err.message);
        });
    }
  });
  return () => unsubscribe();
}, []);


  return { userId, error };
}
