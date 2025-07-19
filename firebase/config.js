// firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG

  const firebaseConfig = {
    apiKey: "AIzaSyAzJ4GiPDkmYmX5rqQIgUJkZ6joypPmqW0",
    authDomain: "clothing-store-a9fd2.firebaseapp.com",
    projectId: "clothing-store-a9fd2",
    storageBucket: "clothing-store-a9fd2.firebasestorage.app",
    messagingSenderId: "786500086820",
    appId: "1:786500086820:web:59f286f9f9cece7831bcb1",
    measurementId: "G-J26PEVZVYN"
  };


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;


