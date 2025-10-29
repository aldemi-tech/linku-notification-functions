# Linku Notification Functions - Documentation

## Overview

This Firebase Cloud Functions project provides a complete FCM (Firebase Cloud Messaging) notification system with two main components:

1. **HTTP Endpoint** (`sendNotification`): Receives notification requests via POST and saves them to Firestore
2. **Firestore Trigger** (`onNotificationCreated`): Automatically sends FCM notifications when new documents are created in the notifications collection

## Architecture

```
src/
├── index.ts                    # Main entry point, exports all functions
├── types/
│   └── index.ts               # TypeScript type definitions
├── config/
│   └── firebase.ts            # Firebase Admin SDK initialization
├── services/
│   ├── notification.service.ts # Firestore operations for notifications
│   └── fcm.service.ts         # FCM messaging operations
└── functions/
    ├── http.function.ts       # HTTP endpoint for receiving requests
    └── trigger.function.ts    # Firestore trigger for sending notifications
```

## API Usage

### Send Notification Request

**Endpoint:** `POST /sendNotification`

**Request Body:**
```json
{
  "type": "payment",
  "priority": "high",
  "title": "Payment Received",
  "message": "Your payment of $100 was successful",
  "content_html": "<h1>Thank you!</h1><p>Payment confirmed</p>",
  "action": {
    "type": "open_url",
    "value": "https://example.com/receipt/123"
  },
  "user_id": "user123",
  "fcm_token": "optional-specific-token",
  "metadata": {
    "payment_id": "pay_123",
    "amount": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "notification_id": "notif_abc123",
  "message": "Notification created successfully"
}
```

### Notification Flow

1. Client sends POST request to `/sendNotification`
2. Function validates request and creates document in `notifications` collection
3. Firestore trigger detects new document
4. Function fetches user's FCM token(s) from `users` collection
5. Sends FCM notification to device(s)
6. Updates notification status to `sent` or `failed`

## Configuration

### Firebase Collections

**notifications** collection:
- Stores all notification requests
- Status tracking: `pending`, `sent`, `failed`, `scheduled`
- Automatic timestamps and attempt counters

**users** collection:
- Must contain user documents with FCM tokens
- Fields: `fcm_token` (string) or `fcm_tokens` (array)
- Optional: `notification_enabled` (boolean)

### Environment Setup

1. Initialize Firebase project:
```bash
firebase login
firebase use --add
```

2. Install dependencies:
```bash
npm install
```

3. Deploy functions:
```bash
npm run deploy
```

## Testing

### Local Emulators

```bash
npm run serve
```

Then send test requests to `http://localhost:5001/<project-id>/us-central1/sendNotification`

### Example cURL

```bash
curl -X POST http://localhost:5001/<project-id>/us-central1/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "priority": "normal",
    "title": "Test Notification",
    "message": "This is a test",
    "user_id": "user123"
  }'
```

## Advanced Features

### Multiple Device Support

The system automatically sends to all registered FCM tokens for a user:
- Single `fcm_token` field
- Array of tokens in `fcm_tokens` field
- Deduplicates tokens automatically

### Scheduled Notifications

Set `scheduled_at` field to send notifications at a specific time:
```json
{
  "scheduled_at": "2024-01-15T10:00:00Z",
  ...
}
```

### Priority Handling

Three priority levels with platform-specific settings:
- `high`: Immediate delivery, bypass battery optimization
- `normal`: Standard delivery
- `low`: Delivery when device is idle

### Action Types

Common action types:
- `open_url`: Opens browser/webview with URL
- `navigate`: Navigate to specific app screen
- `deep_link`: App deep linking
- `open_chat`: Open chat with user/room
- `view_details`: View detail page

## Error Handling

### Notification Failures

Failed notifications are automatically marked with:
- Status: `failed`
- Error message in `error` field
- Attempt counter in `attempts` field

Common failure reasons:
- No FCM tokens found for user
- Invalid or expired FCM token
- User has notifications disabled
- Network errors

### Monitoring

Check function logs:
```bash
npm run logs
```

View specific function:
```bash
firebase functions:log --only sendNotification
firebase functions:log --only onNotificationCreated
```

## Security Considerations

1. **Authentication**: Add authentication middleware to HTTP endpoint
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Token Validation**: Validate FCM tokens before storage
4. **User Permissions**: Check user permissions before sending notifications

## Production Deployment

```bash
# Build TypeScript
npm run build

# Deploy to production
npm run deploy

# Deploy specific function
firebase deploy --only functions:sendNotification
firebase deploy --only functions:onNotificationCreated
```

## Troubleshooting

### No notifications received

1. Check user has valid FCM token in Firestore
2. Verify notification_enabled is not false
3. Check function logs for errors
4. Verify device has notification permissions

### Duplicate notifications

- Firestore trigger may fire multiple times (rare)
- Function checks status to prevent re-sending
- Use idempotency keys in production

### Token expiration

- Implement token refresh mechanism in app
- Remove expired tokens from Firestore
- Handle FCM token refresh events
