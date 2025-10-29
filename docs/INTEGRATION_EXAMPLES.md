# FCM Notification Integration Examples

## React Native Integration

### Setup FCM in React Native

```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Request Permission and Get Token

```typescript
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// Request notification permission
async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }
}

// Get FCM token
async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    
    // Save token to Firestore user profile
    await saveTokenToFirestore(token);
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
}

// Save token to user profile
async function saveTokenToFirestore(token: string) {
  const userId = 'current-user-id'; // Get from auth
  
  await firestore()
    .collection('users')
    .doc(userId)
    .set({
      fcm_token: token,
      notification_enabled: true,
    }, { merge: true });
}
```

### Handle Incoming Notifications

```typescript
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      
      // Display in-app notification
      showInAppNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
      });
    });

    // Handle notification opened (background/quit state)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened from background:', remoteMessage);
      handleNotificationAction(remoteMessage.data);
    });

    // Check if app was opened from notification (quit state)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification opened from quit state:', remoteMessage);
          handleNotificationAction(remoteMessage.data);
        }
      });

    return unsubscribe;
  }, []);

  return <YourApp />;
}

// Handle notification actions
function handleNotificationAction(data: any) {
  const { action_type, action_value } = data;
  
  switch (action_type) {
    case 'open_url':
      Linking.openURL(action_value);
      break;
    case 'navigate':
      navigation.navigate(action_value);
      break;
    case 'deep_link':
      // Handle deep link
      break;
  }
}
```

### Background Message Handler

```typescript
// index.js (root of your app)
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});
```

## Frontend API Client

### TypeScript Client

```typescript
interface SendNotificationRequest {
  type: string;
  priority: 'high' | 'normal' | 'low';
  title: string;
  message: string;
  content_html?: string;
  action?: {
    type: string;
    value: string;
  };
  user_id: string;
  fcm_token?: string;
  metadata?: Record<string, any>;
}

interface SendNotificationResponse {
  success: boolean;
  notification_id: string;
  message: string;
}

class NotificationClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async sendNotification(
    request: SendNotificationRequest
  ): Promise<SendNotificationResponse> {
    const response = await fetch(`${this.baseUrl}/sendNotification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send notification');
    }

    return response.json();
  }
}

// Usage
const client = new NotificationClient(
  'https://us-central1-your-project.cloudfunctions.net'
);

// Send payment notification
await client.sendNotification({
  type: 'payment',
  priority: 'high',
  title: 'Payment Successful',
  message: 'Your payment of $100 was processed',
  action: {
    type: 'open_url',
    value: 'https://example.com/receipt/123',
  },
  user_id: 'user123',
  metadata: {
    payment_id: 'pay_123',
    amount: 100,
  },
});
```

## Common Use Cases

### 1. Payment Confirmation

```typescript
await client.sendNotification({
  type: 'payment_success',
  priority: 'high',
  title: 'Payment Received',
  message: `Your payment of $${amount} was successful`,
  content_html: `
    <div style="text-align: center;">
      <h2>✅ Payment Confirmed</h2>
      <p>Amount: $${amount}</p>
      <p>Transaction ID: ${transactionId}</p>
    </div>
  `,
  action: {
    type: 'navigate',
    value: 'PaymentReceipt',
  },
  user_id: userId,
  metadata: {
    payment_id: paymentId,
    amount,
    currency: 'USD',
  },
});
```

### 2. Booking Reminder

```typescript
await client.sendNotification({
  type: 'booking_reminder',
  priority: 'normal',
  title: 'Upcoming Appointment',
  message: 'Your appointment is in 1 hour',
  action: {
    type: 'navigate',
    value: 'BookingDetails',
  },
  user_id: userId,
  scheduled_at: new Date(appointmentTime.getTime() - 60 * 60 * 1000), // 1 hour before
  metadata: {
    booking_id: bookingId,
    appointment_time: appointmentTime.toISOString(),
  },
});
```

### 3. Chat Message

```typescript
await client.sendNotification({
  type: 'chat_message',
  priority: 'high',
  title: `New message from ${senderName}`,
  message: messagePreview,
  action: {
    type: 'open_chat',
    value: chatRoomId,
  },
  user_id: recipientId,
  metadata: {
    sender_id: senderId,
    sender_name: senderName,
    chat_room_id: chatRoomId,
    message_id: messageId,
  },
});
```

### 4. System Alert

```typescript
await client.sendNotification({
  type: 'system_alert',
  priority: 'high',
  title: 'Account Security Alert',
  message: 'New login detected from unknown device',
  content_html: `
    <div style="padding: 20px; background: #fff3cd;">
      <h3>⚠️ Security Alert</h3>
      <p>A new login was detected:</p>
      <ul>
        <li>Device: ${deviceName}</li>
        <li>Location: ${location}</li>
        <li>Time: ${loginTime}</li>
      </ul>
    </div>
  `,
  action: {
    type: 'navigate',
    value: 'SecuritySettings',
  },
  user_id: userId,
  metadata: {
    login_id: loginId,
    device: deviceName,
    location,
  },
});
```

### 5. Bulk Notifications

```typescript
// Send to multiple users
const userIds = ['user1', 'user2', 'user3'];

await Promise.all(
  userIds.map(userId =>
    client.sendNotification({
      type: 'announcement',
      priority: 'normal',
      title: 'New Feature Available',
      message: 'Check out our new feature!',
      action: {
        type: 'open_url',
        value: 'https://example.com/new-feature',
      },
      user_id: userId,
    })
  )
);
```

## Testing Locally

### Using cURL

```bash
curl -X POST http://localhost:5001/your-project/us-central1/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "test",
    "priority": "normal",
    "title": "Test Notification",
    "message": "This is a test message",
    "user_id": "test_user_123"
  }'
```

### Using Postman

1. Method: POST
2. URL: `http://localhost:5001/your-project/us-central1/sendNotification`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "type": "test",
  "priority": "normal",
  "title": "Test Notification",
  "message": "This is a test message",
  "user_id": "test_user_123"
}
```

## Error Handling

```typescript
try {
  await client.sendNotification(notificationData);
} catch (error) {
  if (error instanceof Error) {
    // Handle specific errors
    if (error.message.includes('Missing required fields')) {
      console.error('Invalid notification data:', error.message);
    } else if (error.message.includes('User') && error.message.includes('not found')) {
      console.error('User not found');
    } else {
      console.error('Failed to send notification:', error.message);
    }
  }
}
```
