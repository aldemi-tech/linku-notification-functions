# API Usage Examples

## Sending Notifications via HTTP Endpoint

### Base URL
```
https://us-central1-linku-app.cloudfunctions.net/sendNotification
```

## Examples by Notification Type

### 1. Messages (Chat/Direct Communication)

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "messages",
    "priority": "high",
    "title": "New message from John Doe",
    "message": "Hey! Are you available for a quick call?",
    "user_id": "user_abc123",
    "action": {
      "type": "navigate",
      "value": "ChatScreen"
    },
    "metadata": {
      "sender_id": "user_xyz789",
      "sender_name": "John Doe",
      "chat_id": "chat_456"
    }
  }'
```

**TypeScript:**
```typescript
await fetch('https://us-central1-linku-app.cloudfunctions.net/sendNotification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'messages',
    priority: 'high',
    title: 'New message from John Doe',
    message: 'Hey! Are you available for a quick call?',
    user_id: 'user_abc123',
    action: {
      type: 'navigate',
      value: 'ChatScreen'
    },
    metadata: {
      sender_id: 'user_xyz789',
      sender_name: 'John Doe',
      chat_id: 'chat_456'
    }
  })
});
```

### 2. New Requests (Bookings/Service Requests)

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "newRequests",
    "priority": "normal",
    "title": "New Service Request",
    "message": "You have a new cleaning service request for tomorrow at 10 AM",
    "user_id": "provider_123",
    "action": {
      "type": "navigate",
      "value": "RequestDetails"
    },
    "metadata": {
      "request_id": "req_789",
      "service_type": "cleaning",
      "scheduled_time": "2025-10-30T10:00:00Z"
    }
  }'
```

**TypeScript:**
```typescript
await notificationClient.sendNotification({
  type: 'newRequests',
  priority: 'normal',
  title: 'New Service Request',
  message: 'You have a new cleaning service request for tomorrow at 10 AM',
  user_id: 'provider_123',
  action: {
    type: 'navigate',
    value: 'RequestDetails'
  },
  metadata: {
    request_id: 'req_789',
    service_type: 'cleaning',
    scheduled_time: '2025-10-30T10:00:00Z'
  }
});
```

### 3. Payments

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payments",
    "priority": "high",
    "title": "Payment Received",
    "message": "Your payment of $150.00 was successful",
    "user_id": "user_abc123",
    "content_html": "<div style=\"text-align: center;\"><h2>✅ Payment Confirmed</h2><p>Amount: $150.00</p><p>Transaction ID: txn_456789</p></div>",
    "action": {
      "type": "navigate",
      "value": "PaymentReceipt"
    },
    "metadata": {
      "transaction_id": "txn_456789",
      "amount": 150.00,
      "currency": "USD",
      "payment_method": "card"
    }
  }'
```

**TypeScript:**
```typescript
await notificationClient.sendNotification({
  type: 'payments',
  priority: 'high',
  title: 'Payment Received',
  message: 'Your payment of $150.00 was successful',
  user_id: 'user_abc123',
  content_html: `
    <div style="text-align: center;">
      <h2>✅ Payment Confirmed</h2>
      <p>Amount: $150.00</p>
      <p>Transaction ID: txn_456789</p>
    </div>
  `,
  action: {
    type: 'navigate',
    value: 'PaymentReceipt'
  },
  metadata: {
    transaction_id: 'txn_456789',
    amount: 150.00,
    currency: 'USD',
    payment_method: 'card'
  }
});
```

### 4. Promotions (Marketing Content)

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "low",
    "title": "Special Offer: 20% Off!",
    "message": "Get 20% off your next booking. Limited time offer!",
    "user_id": "user_abc123",
    "action": {
      "type": "open_url",
      "value": "https://example.com/promotions/winter-sale"
    },
    "metadata": {
      "promo_code": "WINTER20",
      "valid_until": "2025-12-31"
    }
  }'
```

**Note:** When `type` is omitted, it defaults to `"promotions"`.

**TypeScript:**
```typescript
// Type is optional and defaults to 'promotions'
await notificationClient.sendNotification({
  priority: 'low',
  title: 'Special Offer: 20% Off!',
  message: 'Get 20% off your next booking. Limited time offer!',
  user_id: 'user_abc123',
  action: {
    type: 'open_url',
    value: 'https://example.com/promotions/winter-sale'
  },
  metadata: {
    promo_code: 'WINTER20',
    valid_until: '2025-12-31'
  }
});
```

### 5. Status Updates

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "statusUpdates",
    "priority": "normal",
    "title": "Booking Confirmed",
    "message": "Your cleaning service has been confirmed for Oct 30, 10:00 AM",
    "user_id": "user_abc123",
    "action": {
      "type": "navigate",
      "value": "BookingDetails"
    },
    "metadata": {
      "booking_id": "bkg_123",
      "status": "confirmed",
      "previous_status": "pending"
    }
  }'
```

**TypeScript:**
```typescript
await notificationClient.sendNotification({
  type: 'statusUpdates',
  priority: 'normal',
  title: 'Booking Confirmed',
  message: 'Your cleaning service has been confirmed for Oct 30, 10:00 AM',
  user_id: 'user_abc123',
  action: {
    type: 'navigate',
    value: 'BookingDetails'
  },
  metadata: {
    booking_id: 'bkg_123',
    status: 'confirmed',
    previous_status: 'pending'
  }
});
```

## Advanced Examples

### Scheduled Notification

Send a notification at a specific time in the future:

```typescript
const reminderTime = new Date('2025-10-30T09:00:00Z');

await notificationClient.sendNotification({
  type: 'statusUpdates',
  priority: 'normal',
  title: 'Appointment Reminder',
  message: 'Your appointment is in 1 hour',
  user_id: 'user_abc123',
  scheduled_at: reminderTime,
  metadata: {
    appointment_id: 'apt_456'
  }
});
```

### Notification with Specific FCM Token

Override the user's stored tokens and send to a specific device:

```typescript
await notificationClient.sendNotification({
  type: 'messages',
  priority: 'high',
  title: 'Test Notification',
  message: 'This is sent to a specific device only',
  user_id: 'user_abc123',
  fcm_token: 'dR3fE...specific_token_1234'
});
```

### Rich Notification with HTML Content

```typescript
await notificationClient.sendNotification({
  type: 'payments',
  priority: 'high',
  title: 'Invoice Ready',
  message: 'Your invoice for October services is ready',
  content_html: `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h1 style="color: #333;">Invoice #INV-2025-10</h1>
          <hr />
          <table style="width: 100%; margin-top: 20px;">
            <tr>
              <td><strong>Service:</strong></td>
              <td>Premium Cleaning</td>
            </tr>
            <tr>
              <td><strong>Date:</strong></td>
              <td>October 29, 2025</td>
            </tr>
            <tr>
              <td><strong>Amount:</strong></td>
              <td style="color: #4CAF50; font-size: 18px;"><strong>$150.00</strong></td>
            </tr>
          </table>
          <p style="margin-top: 20px;">
            <a href="https://example.com/invoice/INV-2025-10" 
               style="background: #2196F3; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              View Invoice
            </a>
          </p>
        </div>
      </body>
    </html>
  `,
  user_id: 'user_abc123',
  action: {
    type: 'open_url',
    value: 'https://example.com/invoice/INV-2025-10'
  },
  metadata: {
    invoice_id: 'INV-2025-10',
    amount: 150.00
  }
});
```

## Error Handling

### User Preferences Blocking

If a user has disabled a specific notification type:

```typescript
// User has disabled 'promotions' in their preferences
await notificationClient.sendNotification({
  type: 'promotions',
  title: 'Sale Alert',
  message: 'Big sale happening now!',
  priority: 'low',
  user_id: 'user_abc123'
});

// Result: Notification will be marked as 'failed' with error:
// "User has disabled promotions notifications"
```

### No FCM Tokens

If a user has no FCM tokens registered:

```typescript
await notificationClient.sendNotification({
  type: 'messages',
  title: 'Hello',
  message: 'Test message',
  priority: 'normal',
  user_id: 'user_without_tokens'
});

// Result: Notification will be marked as 'failed' with error:
// "No FCM tokens available"
```

### Invalid Notification Type

```bash
curl -X POST https://us-central1-linku-app.cloudfunctions.net/sendNotification \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invalid_type",
    "title": "Test",
    "message": "Test message",
    "priority": "normal",
    "user_id": "user_abc123"
  }'

# Response: 400 Bad Request
{
  "error": "Invalid notification type. Must be one of: messages, newRequests, payments, promotions, statusUpdates"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "notification_id": "xyz789abc",
  "message": "Notification created successfully"
}
```

### Error Response

```json
{
  "error": "Missing required fields: title, message, user_id"
}
```

## Testing with Postman

### Create a Collection

1. Create a new POST request
2. URL: `https://us-central1-linku-app.cloudfunctions.net/sendNotification`
3. Headers:
   - `Content-Type`: `application/json`
4. Body (raw JSON):

```json
{
  "type": "messages",
  "priority": "high",
  "title": "Test Notification",
  "message": "This is a test message",
  "user_id": "your_test_user_id",
  "metadata": {
    "test": true
  }
}
```

## Integration with Backend Services

### Node.js/Express Example

```typescript
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const NOTIFICATION_ENDPOINT = 'https://us-central1-linku-app.cloudfunctions.net/sendNotification';

app.post('/api/send-booking-confirmation', async (req, res) => {
  const { userId, bookingId, serviceType, scheduledTime } = req.body;
  
  try {
    const response = await fetch(NOTIFICATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'statusUpdates',
        priority: 'high',
        title: 'Booking Confirmed!',
        message: `Your ${serviceType} service has been confirmed`,
        user_id: userId,
        action: {
          type: 'navigate',
          value: 'BookingDetails'
        },
        metadata: {
          booking_id: bookingId,
          scheduled_time: scheduledTime
        }
      })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Python/Flask Example

```python
import requests
from flask import Flask, request, jsonify

app = Flask(__name__)
NOTIFICATION_ENDPOINT = 'https://us-central1-linku-app.cloudfunctions.net/sendNotification'

@app.route('/api/send-payment-notification', methods=['POST'])
def send_payment_notification():
    data = request.json
    
    notification_data = {
        'type': 'payments',
        'priority': 'high',
        'title': 'Payment Received',
        'message': f"Your payment of ${data['amount']} was successful",
        'user_id': data['user_id'],
        'metadata': {
            'transaction_id': data['transaction_id'],
            'amount': data['amount'],
            'currency': data.get('currency', 'USD')
        }
    }
    
    try:
        response = requests.post(NOTIFICATION_ENDPOINT, json=notification_data)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500
```
