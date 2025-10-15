import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// Try multiple sources for environment variables (process.env and import.meta.env)
const getEnvVar = (key: string, viteKey?: string) => {
  return process.env[key] || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env[viteKey || key] : undefined);
};

// Debug only in development
if (process.env.NODE_ENV === 'development') {
  console.log('Firebase Config Debug:', {
    apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY') ? 'SET' : 'MISSING',
    authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN') ? 'SET' : 'MISSING',
    projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID') ? 'SET' : 'MISSING'
  });
}

const firebaseConfig = {
  apiKey: getEnvVar('REACT_APP_FIREBASE_API_KEY', 'VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('REACT_APP_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('REACT_APP_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('REACT_APP_FIREBASE_STORAGE_BUCKET', 'VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('REACT_APP_FIREBASE_MESSAGING_SENDER_ID', 'VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('REACT_APP_FIREBASE_APP_ID', 'VITE_FIREBASE_APP_ID')
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  { key: 'REACT_APP_FIREBASE_API_KEY', viteKey: 'VITE_FIREBASE_API_KEY' },
  { key: 'REACT_APP_FIREBASE_AUTH_DOMAIN', viteKey: 'VITE_FIREBASE_AUTH_DOMAIN' },
  { key: 'REACT_APP_FIREBASE_PROJECT_ID', viteKey: 'VITE_FIREBASE_PROJECT_ID' },
  { key: 'REACT_APP_FIREBASE_STORAGE_BUCKET', viteKey: 'VITE_FIREBASE_STORAGE_BUCKET' },
  { key: 'REACT_APP_FIREBASE_MESSAGING_SENDER_ID', viteKey: 'VITE_FIREBASE_MESSAGING_SENDER_ID' },
  { key: 'REACT_APP_FIREBASE_APP_ID', viteKey: 'VITE_FIREBASE_APP_ID' }
];

const missingVars = requiredEnvVars.filter(({ key, viteKey }) => !getEnvVar(key, viteKey));
if (missingVars.length > 0) {
  const missingKeys = missingVars.map(({ key }) => key).join(', ');
  throw new Error(`Missing required environment variables: ${missingKeys}. Please check your .env file or Netlify environment variables.`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
