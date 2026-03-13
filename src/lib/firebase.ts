/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAnWMbb7PIZI0rqUTj20Ft7xxuA9NrDOOc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "betrent-74922.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "betrent-74922",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "betrent-74922.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "804795623899",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:804795623899:web:c4b794a313a45b15b11ffe",
};

if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.warn("Firebase API Key is missing. Please set VITE_FIREBASE_API_KEY in your environment variables.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
