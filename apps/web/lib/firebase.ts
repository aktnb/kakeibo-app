import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = !!(apiKey && authDomain && projectId);

const app =
  isFirebaseConfigured
    ? getApps().length === 0
      ? initializeApp({ apiKey, authDomain, projectId })
      : getApp()
    : null;

export const firebaseAuth = app ? getAuth(app) : null;
