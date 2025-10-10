// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- 1. Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlQ2YIWj3rWHO6VlsMmoCw_bbQyOgvpm0",
  authDomain: "electronicanr-app.firebaseapp.com",
  projectId: "electronicanr-app",
  storageBucket: "electronicanr-app.appspot.com", // Corrected storage bucket
  messagingSenderId: "356757012271",
  appId: "1:356757012271:web:2980680e0cce81e81eebda",
  measurementId: "G-your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- 2. Initialize and export storage
