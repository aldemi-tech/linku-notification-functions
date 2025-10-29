import * as functions from 'firebase-functions';
import { Request, Response } from 'firebase-functions';
import { NotificationRequest } from '../types';
import { createNotification } from '../services/notification.service';

/**
 * HTTP Cloud Function to receive notification requests
 * 
 * POST /sendNotification
 * Body: NotificationRequest
 */
export const notificationSendPush = functions.https.onRequest(async (req: Request, res: Response) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const notificationData = req.body as NotificationRequest;

    // Validate required fields
    if (!notificationData.type || !notificationData.title || 
        !notificationData.message || !notificationData.user_id) {
      res.status(400).json({ 
        error: 'Missing required fields: type, title, message, user_id' 
      });
      return;
    }

    // Validate priority
    if (!['high', 'normal', 'low'].includes(notificationData.priority)) {
      res.status(400).json({ 
        error: 'Invalid priority. Must be: high, normal, or low' 
      });
      return;
    }

    // Create notification document in Firestore
    const notificationId = await createNotification(notificationData);

    res.status(201).json({
      success: true,
      notification_id: notificationId,
      message: 'Notification created successfully',
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});
