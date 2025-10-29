import * as functions from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import { EventContext } from 'firebase-functions';
import { NotificationDocument } from '../types';
import { getUserFCMTokens, updateNotificationStatus, incrementNotificationAttempts } from '../services/notification.service';
import { sendFCMNotification, sendFCMNotificationToMultiple } from '../services/fcm.service';

/**
 * Firestore Trigger Cloud Function
 * Listens to new documents in the notifications collection and sends FCM messages
 */
export const onNotificationCreated = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: EventContext) => {
    const notificationId = context.params.notificationId;
    const notification = snapshot.data() as NotificationDocument;

    try {
      // Skip if notification is scheduled for later
      if (notification.scheduled_at && new Date(notification.scheduled_at) > new Date()) {
        console.log(`Notification ${notificationId} is scheduled for later`);
        return;
      }

      // Skip if already sent or failed
      if (notification.status === 'sent' || notification.status === 'failed') {
        console.log(`Notification ${notificationId} already processed with status: ${notification.status}`);
        return;
      }

      await incrementNotificationAttempts(notificationId);

      let tokens: string[] = [];

      // If specific FCM token provided, use it
      if (notification.fcm_token) {
        tokens = [notification.fcm_token];
      } else {
        // Otherwise, fetch tokens from user profile
        tokens = await getUserFCMTokens(notification.user_id);
      }

      if (tokens.length === 0) {
        console.warn(`No FCM tokens found for user ${notification.user_id}`);
        await updateNotificationStatus(
          notificationId,
          'failed',
          'No FCM tokens available'
        );
        return;
      }

      // Send notification
      if (tokens.length === 1) {
        await sendFCMNotification(tokens[0], notification);
        console.log(`Notification ${notificationId} sent successfully to single token`);
      } else {
        const result = await sendFCMNotificationToMultiple(tokens, notification);
        console.log(
          `Notification ${notificationId} sent to multiple tokens: ` +
          `${result.successCount} success, ${result.failureCount} failures`
        );

        if (result.failureCount > 0) {
          console.error('FCM send errors:', result.errors);
        }
      }

      // Update notification status to sent
      await updateNotificationStatus(notificationId, 'sent');
    } catch (error: any) {
      console.error(`Error sending notification ${notificationId}:`, error);

      // Update notification status to failed
      await updateNotificationStatus(
        notificationId,
        'failed',
        error.message || 'Unknown error'
      );
    }
  });
