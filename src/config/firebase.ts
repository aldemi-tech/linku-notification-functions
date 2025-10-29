import * as admin from 'firebase-admin';

let initialized = false;

/**
 * Initialize Firebase Admin SDK
 * Uses lazy initialization to avoid issues in test environment
 */
export const initializeFirebase = (): void => {
  if (!initialized) {
    admin.initializeApp();
    initialized = true;
  }
};

/**
 * Get Firestore instance
 */
export const getFirestore = (): admin.firestore.Firestore => {
  initializeFirebase();
  return admin.firestore();
};

/**
 * Get Messaging instance
 */
export const getMessaging = (): admin.messaging.Messaging => {
  initializeFirebase();
  return admin.messaging();
};
