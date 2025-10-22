'use client';

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp() {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error('Firebase configuration is missing. Проверьте переменные окружения.');
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseMessaging() {
  if (!messaging) {
    const application = getFirebaseApp();
    messaging = getMessaging(application);
  }
  return messaging;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return null;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
  if (!vapidKey) throw new Error('FCM VAPID key is not configured');
  const token = await getToken(getFirebaseMessaging(), { vapidKey });
  return token;
}

export function subscribeToForegroundMessages(callback: Parameters<typeof onMessage>[1]) {
  const messagingInstance = getFirebaseMessaging();
  return onMessage(messagingInstance, callback);
}
