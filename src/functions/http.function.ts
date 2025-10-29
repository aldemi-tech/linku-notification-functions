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

    // Set default notification type to 'promotions' if not provided
    if (!notificationData.type) {
      notificationData.type = 'promotions';
    }

    // Validate required fields
    if (!notificationData.title || !notificationData.message || !notificationData.user_id) {
      res.status(400).json({ 
        error: 'Missing required fields: title, message, user_id' 
      });
      return;
    }

    // Validate notification type
    const validTypes = ['messages', 'newRequests', 'payments', 'promotions', 'statusUpdates'];
    if (!validTypes.includes(notificationData.type)) {
      res.status(400).json({ 
        error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` 
      });
      return;
    }

    // Validate priority
    if (!notificationData.priority || !['high', 'normal', 'low'].includes(notificationData.priority)) {
      notificationData.priority = 'normal'; // Default to normal if not provided
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
