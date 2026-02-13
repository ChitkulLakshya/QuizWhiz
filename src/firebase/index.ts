'use client';
export { db, auth, app } from './firebase';
export { initializeFirebase, getFirestoreInstance as getFirestore } from './firebase';

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
