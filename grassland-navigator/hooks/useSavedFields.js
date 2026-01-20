"use client";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase"; // make sure you export db from firebase.js

export default function useSavedFields(userId) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFields([]);
      setLoading(false);
      return;
    }

    try {
      const q = collection(db, `users/${userId}/fields`);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFields(fetched);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("🔥 Error loading saved fields:", err);
      setFields([]);
      setLoading(false);
    }
  }, [userId]);

  return fields || []; // always return an array
}
