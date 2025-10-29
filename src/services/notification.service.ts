import { getFirestore } from '../config/firebase';
import { NotificationDocument, FCMTokenDocument, NotificationPreferences, NotificationType } from '../types';

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
 * Get user FCM tokens from fcm_tokens subcollection
 */
export const getUserFCMTokens = async (userId: string): Promise<string[]> => {
  const db = getFirestore();

  const tokensSnapshot = await db
    .collection('users')
    .doc(userId)
    .collection('fcm_tokens')
    .get();

  if (tokensSnapshot.empty) {
    return [];
  }

  const tokens: string[] = [];
  tokensSnapshot.forEach((doc) => {
    const tokenData = doc.data() as FCMTokenDocument;
    if (tokenData.token) {
      tokens.push(tokenData.token);
    }
  });

  return [...new Set(tokens)]; // Remove duplicates
};

/**
 * Get user notification preferences
 */
export const getUserNotificationPreferences = async (
  userId: string
): Promise<NotificationPreferences | null> => {
  const db = getFirestore();

  const prefsDoc = await db
    .collection('users')
    .doc(userId)
    .collection('preferences')
    .doc('notifications')
    .get();

  if (!prefsDoc.exists) {
    return null;
  }

  return prefsDoc.data() as NotificationPreferences;
};

/**
 * Check if user allows notifications of a specific type
 */
export const canSendNotification = async (
  userId: string,
  notificationType: NotificationType
): Promise<boolean> => {
  const preferences = await getUserNotificationPreferences(userId);

  // If no preferences set, allow all notifications by default
  if (!preferences) {
    return true;
  }

  // Check if the specific notification type is enabled
  return preferences[notificationType] === true;
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
