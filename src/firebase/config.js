// src/firebase/config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYfdBT1_4iSdk7wMJ2PP9mwY61PUlpbpw",
  authDomain: "random-9354e.firebaseapp.com",
  projectId: "random-9354e",
  storageBucket: "random-9354e.firebasestorage.app",
  messagingSenderId: "745690173907",
  appId: "1:745690173907:web:f5455acfeedd6f70bcdf26",
  measurementId: "G-2CWYH8WV6N"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app