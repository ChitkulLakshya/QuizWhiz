/**
 * Firebase initialization - Singleton pattern for Next.js 15 + Turbopack
 * Initializes Firebase app ONCE and exports Firestore and Auth as constants
 * Safe for Hot Module Replacement (HMR) and multiple imports
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // Hardcode authDomain to ensure it is picked up in Electron builds
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'quizmaster-live-3e7c0.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  }),
};

// Validate required environment variables
const isCI = process.env.CI === 'true' || !!process.env.GITHUB_ACTIONS;

const isElectron = typeof window !== 'undefined' && (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || window.location?.protocol === 'app:');

if ((!firebaseConfig.apiKey || (!firebaseConfig.authDomain && !isElectron) || !firebaseConfig.projectId || !firebaseConfig.appId) && !isCI) {
  throw new Error(
    'Missing Firebase configuration. Please ensure all NEXT_PUBLIC_FIREBASE_* environment variables are set in .env.local'
  );
}

// Singleton Firebase app instance
// Safe for Turbopack HMR - getApps() checks for existing instances
let app: FirebaseApp;

if (typeof window !== 'undefined') {
  // Client-side: Use singleton pattern
  if (getApps().length === 0) {
    // In CI without config, we don't initialize to avoid errors, or initialize dummy? 
    // Actually initializeApp might throw if config is empty. 
    // Let's check config presence.
    if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
      console.log('🔥 Firebase initialized (client-side)');
    } else {
      // Mock app for CI
      app = {} as FirebaseApp;
      console.warn('⚠️ CI Environment detected: Mocking Firebase App');
    }
  } else {
    app = getApp();
    console.log('🔥 Firebase app reused (client-side)');
  }
} else {
  // Server-side: Always create new instance (Next.js handles this)
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase initialized (server-side)');
  } else {
    app = {} as FirebaseApp;
    console.warn('⚠️ CI Environment detected: Mocking Firebase App (Server)');
  }
}

// Export Firestore and Auth as constants (singleton instances)
// These are safe to use across the entire app
export const db: Firestore = firebaseConfig.apiKey ? getFirestore(app) : ({} as Firestore);
export const auth: Auth = firebaseConfig.apiKey ? getAuth(app) : ({} as Auth);
export const functions: Functions = firebaseConfig.apiKey ? getFunctions(app, 'us-central1') : ({} as Functions);

// Export app for advanced use cases
export { app };

// Debug: Make db available in window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).db = db;
  console.log('🔧 db available in window.db for debugging');
}
