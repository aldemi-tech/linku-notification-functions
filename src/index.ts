/**
 * Main entry point for Firebase Cloud Functions
 * Exports all cloud functions
 */

export { notificationSendPush } from './functions/http.function';
export { notificationOnCreated } from './functions/trigger.function';
