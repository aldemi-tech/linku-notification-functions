# Firestore Database Structure

## Overview

This document describes the Firestore database structure used by the Linku Notification Functions system.

## Collections Structure

### Users Collection

```
users (collection)
└── {userId} (document)
    ├── name: string
    ├── email: string
    ├── ... (other user fields)
    │
    ├── fcm_tokens (subcollection)
    │   └── {tokenId} (document - auto-generated)
    │       ├── token: string                    // FCM device token
    │       ├── created_at: timestamp
    │       ├── updated_at: timestamp
    │       └── device_info?: object (optional)
    │           ├── platform: string             // 'ios', 'android', 'web'
    │           ├── device_id: string            // Unique device identifier
    │           └── app_version: string          // App version
    │
    └── preferences (subcollection)
        └── notifications (document - fixed ID)
            ├── messages: boolean                // Allow chat/message notifications
            ├── newRequests: boolean             // Allow new booking/request notifications
            ├── payments: boolean                // Allow payment notifications
            ├── promotions: boolean              // Allow promotional notifications
            └── statusUpdates: boolean           // Allow status update notifications
```

### Notifications Collection

```
notifications (collection)
└── {notificationId} (document - auto-generated)
    ├── type: string                            // 'messages', 'newRequests', 'payments', 'promotions', 'statusUpdates'
    ├── priority: string                        // 'high', 'normal', 'low'
    ├── title: string
    ├── message: string
    ├── content_html?: string (optional)
    ├── action?: object (optional)
    │   ├── type: string                        // 'open_url', 'navigate', 'deep_link'
    │   └── value: string
    ├── user_id: string
    ├── fcm_token?: string (optional)
    ├── scheduled_at?: timestamp (optional)
    ├── metadata?: object (optional)
    ├── status: string                          // 'pending', 'sent', 'failed', 'scheduled'
    ├── created_at: timestamp
    ├── sent_at?: timestamp (optional)
    ├── error?: string (optional)
    └── attempts: number
```

## Notification Types

The system supports 5 types of notifications:

| Type | Description | Default Permission |
|------|-------------|-------------------|
| `messages` | Chat messages and direct communications | ✅ Allowed |
| `newRequests` | New booking or service requests | ✅ Allowed |
| `payments` | Payment confirmations and receipts | ✅ Allowed |
| `promotions` | Marketing and promotional content | ✅ Allowed |
| `statusUpdates` | Status changes and updates | ✅ Allowed |

**Note**: If the `type` field is not provided when sending a notification, it defaults to `promotions`.

## User Preferences Behavior

### Default Behavior
If a user doesn't have a `preferences/notifications` document:
- ✅ All notification types are **allowed by default**
- The system will send all notifications to the user

### Custom Preferences
Users can control each notification type individually:

```javascript
// Example: User only wants payment and message notifications
{
  messages: true,
  newRequests: false,
  payments: true,
  promotions: false,
  statusUpdates: false
}
```

When a notification is created:
1. The system checks if the user has preferences set
2. If preferences exist, it verifies if the notification type is enabled
3. If disabled, the notification is marked as `failed` with an appropriate error message
4. If enabled (or no preferences), the notification is sent to all FCM tokens

## FCM Tokens Management

### Multiple Device Support
- Users can have multiple FCM tokens (one per device)
- Each token is stored in a separate document in the `fcm_tokens` subcollection
- When sending notifications, the system retrieves all tokens and sends to each device

### Token Document Structure

```typescript
{
  token: "dR3fE...1234",              // FCM token string
  created_at: Timestamp,               // When token was first registered
  updated_at: Timestamp,               // Last time token was updated
  device_info: {
    platform: "ios",                   // or "android", "web"
    device_id: "iPhone14,2",
    app_version: "1.2.3"
  }
}
```

### Adding/Updating Tokens

When a user logs in or refreshes their FCM token:

```typescript
// Add new token
await firestore()
  .collection('users')
  .doc(userId)
  .collection('fcm_tokens')
  .add({
    token: newFcmToken,
    created_at: firestore.FieldValue.serverTimestamp(),
    updated_at: firestore.FieldValue.serverTimestamp(),
    device_info: {
      platform: Platform.OS,
      device_id: deviceId,
      app_version: appVersion,
    }
  });
```

### Token Cleanup

It's recommended to implement token cleanup when:
- A user logs out (delete specific token)
- A token becomes invalid (FCM returns error)
- Periodic cleanup of old/unused tokens

```typescript
// Delete specific token
await firestore()
  .collection('users')
  .doc(userId)
  .collection('fcm_tokens')
  .doc(tokenId)
  .delete();
```

## Security Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // FCM tokens subcollection
      match /fcm_tokens/{tokenId} {
        // Users can manage their own tokens
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Preferences subcollection
      match /preferences/{docId} {
        // Users can manage their own preferences
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Only cloud functions can write
      allow write: if false;
      // Users can read their own notifications
      allow read: if request.auth != null && resource.data.user_id == request.auth.uid;
    }
  }
}
```

## Example Queries

### Get all FCM tokens for a user

```typescript
const tokensSnapshot = await firestore()
  .collection('users')
  .doc(userId)
  .collection('fcm_tokens')
  .get();

const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
```

### Get user notification preferences

```typescript
const prefsDoc = await firestore()
  .collection('users')
  .doc(userId)
  .collection('preferences')
  .doc('notifications')
  .get();

const preferences = prefsDoc.data();
```

### Update specific preference

```typescript
await firestore()
  .collection('users')
  .doc(userId)
  .collection('preferences')
  .doc('notifications')
  .update({
    promotions: false  // Disable promotional notifications
  });
```

### Query user's notification history

```typescript
const notificationsSnapshot = await firestore()
  .collection('notifications')
  .where('user_id', '==', userId)
  .where('status', '==', 'sent')
  .orderBy('created_at', 'desc')
  .limit(50)
  .get();
```

## Migration Guide

If you're migrating from the old structure where FCM tokens were stored directly in the user document:

### Old Structure
```javascript
users/{userId}
  ├── fcm_token: string
  └── notification_enabled: boolean
```

### Migration Script

```typescript
async function migrateUserTokens() {
  const usersSnapshot = await firestore().collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    const userData = userDoc.data();
    
    // Migrate FCM token if exists
    if (userData.fcm_token) {
      await firestore()
        .collection('users')
        .doc(userDoc.id)
        .collection('fcm_tokens')
        .add({
          token: userData.fcm_token,
          created_at: firestore.FieldValue.serverTimestamp(),
          updated_at: firestore.FieldValue.serverTimestamp(),
        });
      
      // Optionally remove old field
      await userDoc.ref.update({
        fcm_token: firestore.FieldValue.delete()
      });
    }
    
    // Migrate notification_enabled to preferences
    if (typeof userData.notification_enabled === 'boolean') {
      const allEnabled = userData.notification_enabled;
      
      await firestore()
        .collection('users')
        .doc(userDoc.id)
        .collection('preferences')
        .doc('notifications')
        .set({
          messages: allEnabled,
          newRequests: allEnabled,
          payments: allEnabled,
          promotions: allEnabled,
          statusUpdates: allEnabled,
        });
      
      // Optionally remove old field
      await userDoc.ref.update({
        notification_enabled: firestore.FieldValue.delete()
      });
    }
  }
}
```
