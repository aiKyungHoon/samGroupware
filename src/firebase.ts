import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCF6EmMKxlrHQqOEZMhp5gKAeeMXVCG0iU",
  authDomain: "churchware-web-2026.firebaseapp.com",
  projectId: "churchware-web-2026",
  storageBucket: "churchware-web-2026.firebasestorage.app",
  messagingSenderId: "471284930598",
  appId: "1:471284930598:web:801e75ebe3a8f57c1c6ee7",
  databaseURL: "https://churchware-web-2026-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getDatabase(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
