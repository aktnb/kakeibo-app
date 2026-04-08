"use client";

import { useEffect } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "../../lib/firebase";

// Firebase ID token は 1 時間で期限切れになるため、自動更新後に Cookie を同期する
export function AuthSync() {
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) return;

    const unsubscribe = onIdTokenChanged(firebaseAuth, async (user) => {
      if (!user) return;
      const idToken = await user.getIdToken();
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
    });

    return unsubscribe;
  }, []);

  return null;
}
