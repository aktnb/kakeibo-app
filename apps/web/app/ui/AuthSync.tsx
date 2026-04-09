"use client";

import { useEffect } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import { firebaseAuth, isFirebaseConfigured } from "../../lib/firebase";

// Firebase ID token は 1 時間で期限切れになるため、自動更新後に Cookie を同期する
export function AuthSync() {
  useEffect(() => {
    const auth = firebaseAuth;
    if (!isFirebaseConfigured || !auth) return;

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        await fetch("/api/auth", { method: "DELETE" });
        return;
      }

      try {
        const idToken = await user.getIdToken();
        await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      } catch {
        await signOut(auth);
        await fetch("/api/auth", { method: "DELETE" });
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
