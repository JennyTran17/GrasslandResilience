"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function login() {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Sign-in error:", err);
        setError(err.message);
      }
    }

    login();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  return { userId, error };
}
