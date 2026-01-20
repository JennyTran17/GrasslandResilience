"use client";
import { useEffect, useState } from "react";
import { auth, signInAnonymously, onAuthStateChanged } from "@/lib/firebase";

export function useAuth() {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      console.log("Auth state initializing...");
      
      if (!auth || !onAuthStateChanged) {
        console.warn("Firebase not properly initialized, using demo mode");
        setUserId('demo-user');
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("✅ Firebase user authenticated:", user.uid);
          setUserId(user.uid);
          setError(null);
        } else {
          console.log("⚙️ Signing in anonymously...");
          if (signInAnonymously) {
            signInAnonymously(auth)
              .then((cred) => {
                console.log("✅ Anonymous sign-in successful:", cred.user.uid);
                setUserId(cred.user.uid);
                setError(null);
              })
              .catch((err) => {
                console.warn("⚠️ Sign-in failed, using demo mode:", err.message);
                setUserId('demo-user');
                setError(null);
              });
          } else {
            setUserId('demo-user');
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("⚠️ Auth initialization failed, using demo mode:", err.message);
      setUserId('demo-user');
      setError(null);
    }
  }, []);


  return { userId, error };
}
