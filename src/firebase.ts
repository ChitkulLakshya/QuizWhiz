/**
 * Firebase initialization - Singleton pattern for Next.js 15 + Turbopack
 * Initializes Firebase app ONCE and exports Firestore and Auth as constants
 * Safe for Hot Module Replacement (HMR) and multiple imports
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'quizmaster-live-3e7c0.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
};
const isCI = process.env.CI === 'true' || !!process.env.GITHUB_ACTIONS;

const isElectron = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || window.location?.protocol === 'app:');

if ((!firebaseConfig.apiKey || (!firebaseConfig.authDomain && !isElectron) || !firebaseConfig.projectId || !firebaseConfig.appId) && !isCI) {
  throw new Error(
    'Missing Firebase configuration. Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set in .env.local'
  );
}
let app: FirebaseApp;

if (typeof window !== 'undefined') {
  if (getApps().length === 0) {
    if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialized (client-side)');
    } else {
      app = {} as FirebaseApp;
      console.warn('⚠️ CI Environment detected: Mocking Firebase App');
    }
  } else {
    app = getApp();
    console.log('🔥 Firebase app reused (client-side)');
  }
} else {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized (server-side)');
  } else {
    app = {} as FirebaseApp;
    console.warn('⚠️ CI Environment detected: Mocking Firebase App (Server)');
  }
}
export const db: Firestore = firebaseConfig.apiKey ? getFirestore(app) : ({} as Firestore);
export const auth: Auth = firebaseConfig.apiKey ? getAuth(app) : ({} as Auth);
export const functions: Functions = firebaseConfig.apiKey ? getFunctions(app, 'us-central1') : ({} as Functions);
export { app };

/**
 * Optional: connect to the local Firebase Emulator Suite.
 * Opt in with NEXT_PUBLIC_USE_FIREBASE_EMULATORS=1 (see .env.local.example).
 * No behaviour change when the flag is unset. The flag lives on globalThis so
 * HMR (module re-eval) or double imports can't connect the same instance twice.
 */
const useFirebaseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === '1';

if (typeof window !== 'undefined' && useFirebaseEmulators && firebaseConfig.apiKey) {
  const globalForEmulators = globalThis as typeof globalThis & {
    __QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__?: boolean;
  };
  if (!globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__) {
    globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__ = true;
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, '127.0.0.1', 8087);
      console.log('🧪 Firebase Emulator Suite connected (auth :9099, firestore :8087)');
    } catch (e) {
      globalForEmulators.__QUIZWHIZ_FIREBASE_EMULATORS_CONNECTED__ = false;
      console.warn('⚠️ Could not connect to Firebase emulators:', e);
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).db = db;
  console.log('🔧 db available in window.db for debugging');
}
