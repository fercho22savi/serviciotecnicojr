// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5Ey-QzXm6bya80caQ_2JuvMvMb_m6i0o",
  authDomain: "serviciotecnicojr-187663-9a086.firebaseapp.com",
  projectId: "serviciotecnicojr-187663-9a086",
  storageBucket: "serviciotecnicojr-187663-9a086.firebasestorage.app",
  messagingSenderId: "346494953061",
  appId: "1:346494953061:web:72e2b32bbe8bfa3f5d088c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const functions = getFunctions(app);