// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Use the EXACT SAME config from your firebaseConfig.ts
const firebaseConfig = {
  apiKey: "AIzaSyBBGSaV5gLV2B0fNH5B5pK6ZutnpTzYuFY",
  authDomain: "stx-hse.firebaseapp.com",
  projectId: "stx-hse",
  storageBucket: "stx-hse.firebasestorage.app",
  messagingSenderId: "918591370060",
  appId: "1:918591370060:web:008dc1988c904d111895e9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/vite.svg', // Make sure this file exists in public folder
    badge: '/vite.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});