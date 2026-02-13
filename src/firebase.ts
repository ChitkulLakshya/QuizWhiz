/**
 * Firebase initialization - Singleton pattern for Next.js 15 + Turbopack
 * Initializes Firebase app ONCE and exports Firestore and Auth as constants
 * Safe for Hot Module Replacement (HMR) and multiple imports
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
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
if (typeof window !== 'undefined') {
  (window as any).db = db;
  console.log('🔧 db available in window.db for debugging');
}
