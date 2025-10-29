/**
 * Notification type definitions
 */

export interface NotificationAction {
  type: string;    // Action type: 'open_url', 'navigate', 'deep_link', etc.
  value: string;   // Action value: URL, route, identifier, etc.
}

export type NotificationType = 'messages' | 'newRequests' | 'payments' | 'promotions' | 'statusUpdates' | 'system';

export interface NotificationRequest {
  type?: NotificationType;   // Notification type (defaults to 'promotions' if not provided)
  priority: 'high' | 'normal' | 'low';
  title: string;             // Notification title
  message: string;           // Notification message body
  content_html?: string;     // Optional HTML content
  action?: NotificationAction;
  user_id: string;           // Target user ID
  fcm_token?: string;        // Optional specific FCM token (if not provided, fetched from user profile)
  scheduled_at?: Date;       // Optional scheduled send time
  metadata?: Record<string, unknown>;  // Additional metadata
}

export interface NotificationDocument extends NotificationRequest {
  id?: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  created_at: Date;
  sent_at?: Date;
  error?: string;
  attempts?: number;
}

export interface UserProfile {
  fcm_token?: string;
  fcm_tokens?: string[];     // Support for multiple devices
  notification_enabled?: boolean;
}

export interface FCMTokenDocument {
  token: string;
  created_at: Date;
  updated_at: Date;
  device_info?: {
    platform?: string;      // 'ios', 'android', 'web'
    device_id?: string;
    app_version?: string;
  };
}

export interface NotificationPreferences {
  messages: boolean;
  newRequests: boolean;
  payments: boolean;
  promotions: boolean;
  statusUpdates: boolean;
  system: boolean;
}
