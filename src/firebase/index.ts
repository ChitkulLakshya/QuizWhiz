'use client';

// Re-export db and auth from root firebase.ts (the single source of truth)
export { db, auth, app } from './firebase';

// Re-export Firebase initialization from firebase.ts (for backward compatibility)
export { initializeFirebase, getFirestoreInstance as getFirestore } from './firebase';

export * from './provider';
// FirebaseClientProvider removed - not needed in App Router
// export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
