/**
 * Main entry point for Firebase Cloud Functions
 * Exports all cloud functions
 */

export { sendNotification } from './functions/http.function';
export { onNotificationCreated } from './functions/trigger.function';
