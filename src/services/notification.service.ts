import { getFirestore } from '../config/firebase';
import { NotificationDocument, UserProfile } from '../types';

/**
 * Create a notification document in Firestore
 */
export const createNotification = async (
  notification: Omit<NotificationDocument, 'id' | 'status' | 'created_at'>
): Promise<string> => {
  const db = getFirestore();

  const doc: NotificationDocument = {
    ...notification,
    status: notification.scheduled_at ? 'scheduled' : 'pending',
    created_at: new Date(),
    attempts: 0,
  };

  const docRef = await db.collection('notifications').add(doc);
  return docRef.id;
};

/**
 * Update notification status
 */
export const updateNotificationStatus = async (
  notificationId: string,
  status: 'sent' | 'failed',
  error?: string
): Promise<void> => {
  const db = getFirestore();

  await db.collection('notifications').doc(notificationId).update({
    status,
    sent_at: status === 'sent' ? new Date() : null,
    error: error || null,
  });
};

/**
 * Get user FCM tokens from user profile
 */
export const getUserFCMTokens = async (userId: string): Promise<string[]> => {
  const db = getFirestore();

  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    throw new Error(`User ${userId} not found`);
  }

  const userData = userDoc.data() as UserProfile;

  // Check if notifications are enabled
  if (userData.notification_enabled === false) {
    return [];
  }

  // Support both single token and multiple tokens
  const tokens: string[] = [];

  if (userData.fcm_token) {
    tokens.push(userData.fcm_token);
  }

  if (userData.fcm_tokens && Array.isArray(userData.fcm_tokens)) {
    tokens.push(...userData.fcm_tokens);
  }

  return [...new Set(tokens)]; // Remove duplicates
};

/**
 * Increment notification attempt counter
 */
export const incrementNotificationAttempts = async (
  notificationId: string
): Promise<void> => {
  const db = getFirestore();

  await db.collection('notifications').doc(notificationId).update({
    attempts: (await db.collection('notifications').doc(notificationId).get()).data()?.attempts || 0 + 1,
  });
};
