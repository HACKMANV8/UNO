import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAA732yl1kXSJxa9RSlOSD9BVlKzthnJjY",
  authDomain: "kriti-e1b44.firebaseapp.com",
  projectId: "kriti-e1b44",
  storageBucket: "kriti-e1b44.firebasestorage.app",
  messagingSenderId: "3515192721",
  appId: "1:3515192721:web:b36471d4ae4841e9e7b630",
  measurementId: "G-5G4L6PTXQ4"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && !auth.currentUser) {
  try {
    // Uncomment these lines if you want to use Firebase emulators
    // connectAuthEmulator(auth, 'http://localhost:9099');
    // connectFirestoreEmulator(firestore, 'localhost', 8080);
    // connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.log('Emulator connection failed:', error);
  }
}

export default app;