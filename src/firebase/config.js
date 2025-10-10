// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlQ2YIWj3rWHO6VlsMmoCw_bbQyOgvpm0",
  authDomain: "electronicanr-app.firebaseapp.com",
  projectId: "electronicanr-app",
  storageBucket: "electronicanr-app.firebasestorage.app",
  messagingSenderId: "356757012271",
  appId: "1:356757012271:web:2980680e0cce81e81eebda",
  measurementId: "G-your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
