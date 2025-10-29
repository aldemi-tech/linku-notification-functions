# Linku Notification Functions

Firebase Cloud Functions for sending FCM (Firebase Cloud Messaging) push notifications.

[![Deploy Status](https://github.com/aldemi-tech/linku-notification-functions/actions/workflows/deploy.yml/badge.svg)](https://github.com/aldemi-tech/linku-notification-functions/actions/workflows/deploy.yml)

## Architecture

This project implements two main cloud functions:

1. **HTTP Endpoint** (`sendNotification`): Receives notification requests and saves them to Firestore
2. **Firestore Trigger** (`onNotificationCreated`): Listens to new documents in the notifications collection and sends FCM messages

### Firestore Structure

```
users (collection)
└── {userId} (document)
    ├── fcm_tokens (subcollection)
    │   └── {tokenId} (document)
    │       ├── token: string
    │       ├── created_at: timestamp
    │       ├── updated_at: timestamp
    │       └── device_info?: object
    └── preferences (subcollection)
        └── notifications (document)
            ├── messages: boolean
            ├── newRequests: boolean
            ├── payments: boolean
            ├── promotions: boolean
            ├── statusUpdates: boolean
            └── system: boolean
```

## Notification Data Structure

```typescript
{
  type?: string;          // Notification type: 'messages', 'newRequests', 'payments', 'promotions', 'statusUpdates', 'system'
                          // Defaults to 'promotions' if not provided
  priority: string;       // Priority level ('high', 'normal', 'low')
  title: string;          // Notification title
  message: string;        // Notification message body
  content_html?: string;  // Optional HTML content
  action?: {
    type: string;         // Action type (e.g., 'open_url', 'navigate')
    value: string;        // Action value (URL, route, etc.)
  };
  user_id: string;        // Target user ID
  fcm_token?: string;     // Optional specific FCM token (if not provided, fetched from user's fcm_tokens subcollection)
  scheduled_at?: Date;    // Optional scheduled send time
}
```

## Notification Types & User Preferences

The system supports 6 types of notifications that can be individually controlled by users:

- **`messages`**: Chat messages and direct communications
- **`newRequests`**: New booking or service requests
- **`payments`**: Payment confirmations and receipts
- **`promotions`**: Marketing and promotional content (default type if not specified)
- **`statusUpdates`**: Status changes and updates
- **`system`**: System notifications, maintenance alerts, and critical app updates

Users can control which types of notifications they receive through the `users/{userId}/preferences/notifications` document. If no preferences are set, all notifications are allowed by default.

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
