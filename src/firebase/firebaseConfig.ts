// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBGSaV5gLV2B0fNH5B5pK6ZutnpTzYuFY",
  authDomain: "stx-hse.firebaseapp.com",
  projectId: "stx-hse",
  storageBucket: "stx-hse.firebasestorage.app",
  messagingSenderId: "918591370060",
  appId: "1:918591370060:web:008dc1988c904d111895e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging service
export const messaging = getMessaging(app);