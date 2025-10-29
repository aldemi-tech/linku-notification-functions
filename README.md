# Linku Notification Functions

Firebase Cloud Functions for sending FCM (Firebase Cloud Messaging) push notifications.

[![Deploy Status](https://github.com/aldemi-tech/linku-notification-functions/actions/workflows/deploy.yml/badge.svg)](https://github.com/aldemi-tech/linku-notification-functions/actions/workflows/deploy.yml)

## Architecture

This project implements two main cloud functions:

1. **HTTP Endpoint** (`sendNotification`): Receives notification requests and saves them to Firestore
2. **Firestore Trigger** (`onNotificationCreated`): Listens to new documents in the notifications collection and sends FCM messages

## Notification Data Structure

```typescript
{
  type: string;           // Notification type (e.g., 'payment', 'booking', 'alert')
  priority: string;       // Priority level ('high', 'normal', 'low')
  title: string;          // Notification title
  message: string;        // Notification message body
  content_html?: string;  // Optional HTML content
  action?: {
    type: string;         // Action type (e.g., 'open_url', 'navigate')
    value: string;        // Action value (URL, route, etc.)
  };
  user_id: string;        // Target user ID
  fcm_token?: string;     // Optional specific FCM token
  scheduled_at?: Date;    // Optional scheduled send time
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
```bash
firebase login
firebase use --add
```

3. Build the project:
```bash
npm run build
```

4. Deploy:
```bash
npm run deploy
```

## Development

Run emulators locally:
```bash
npm run serve
```

## Testing

```bash
npm test
```

## Deployment

```bash
npm run deploy
```
