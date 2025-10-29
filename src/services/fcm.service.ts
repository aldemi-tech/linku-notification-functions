import { getMessaging } from '../config/firebase';
import { NotificationDocument } from '../types';

/**
 * Send FCM notification to a specific token
 */
export const sendFCMNotification = async (
  token: string,
  notification: NotificationDocument
): Promise<string> => {
  const messaging = getMessaging();

  const message: any = {
    token,
    notification: {
      title: notification.title,
      body: notification.message,
    },
    data: {
      type: notification.type,
      priority: notification.priority,
      ...(notification.content_html && { content_html: notification.content_html }),
      ...(notification.action && {
        action_type: notification.action.type,
        action_value: notification.action.value,
      }),
      ...(notification.metadata && { metadata: JSON.stringify(notification.metadata) }),
    },
    android: {
      priority: notification.priority === 'high' ? 'high' : 'normal',
    },
    apns: {
      headers: {
        'apns-priority': notification.priority === 'high' ? '10' : '5',
      },
    },
  };

  const messageId = await messaging.send(message);
  return messageId;
};

/**
 * Send FCM notification to multiple tokens
 */
export const sendFCMNotificationToMultiple = async (
  tokens: string[],
  notification: NotificationDocument
): Promise<{ successCount: number; failureCount: number; errors: any[] }> => {
  const messaging = getMessaging();

  const message: any = {
    notification: {
      title: notification.title,
      body: notification.message,
    },
    data: {
      type: notification.type,
      priority: notification.priority,
      ...(notification.content_html && { content_html: notification.content_html }),
      ...(notification.action && {
        action_type: notification.action.type,
        action_value: notification.action.value,
      }),
      ...(notification.metadata && { metadata: JSON.stringify(notification.metadata) }),
    },
    android: {
      priority: notification.priority === 'high' ? 'high' : 'normal',
    },
    apns: {
      headers: {
        'apns-priority': notification.priority === 'high' ? '10' : '5',
      },
    },
  };

  const response = await messaging.sendEachForMulticast({
    ...message,
    tokens,
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    errors: response.responses
      .map((resp: any, idx: number) => (resp.success ? null : { token: tokens[idx], error: resp.error }))
      .filter(Boolean),
  };
};
