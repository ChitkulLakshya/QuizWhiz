import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'quizmaster-live-3e7c0.firebaseapp.com', // Strict fallback
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Optional: connect to the local Firebase Emulator Suite.
 * Opt in with NEXT_PUBLIC_USE_FIREBASE_EMULATORS=1 (see .env.local.example).
 * No behaviour change when the flag is unset. The flag lives on globalThis
 * (and is only set in the browser) so HMR or double imports can't connect
 * the same app instance twice.
 */
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "1") {
  const globalForEmulators = globalThis as typeof globalThis & {
    __QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__?: boolean;
  };
  if (!globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__) {
    globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__ = true;
    try {
      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8087);
      console.log("🧪 Firebase Emulator Suite connected (auth :9099, firestore :8087)");
    } catch (e) {
      globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__ = false;
      console.warn("⚠️ Could not connect to Firebase emulators:", e);
    }
  }
}

export const initializeFirebase = () => app;
export const getFirestoreInstance = () => db;
console.log("🔥 Firebase initialized (client-side)");
