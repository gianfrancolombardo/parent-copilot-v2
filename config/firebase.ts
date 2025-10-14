import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace these with your actual environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDwV7pnHfvIJPKfANnB5N2io9UqdOvWvvU",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "parents-copilot.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "parents-copilot",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "parents-copilot.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "86922263005",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:86922263005:web:a76064cb815e9993435e34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
