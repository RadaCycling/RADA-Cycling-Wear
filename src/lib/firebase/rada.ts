// Import the functions from the SDKs
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_RADA_apiKey,
    authDomain: import.meta.env.VITE_RADA_authDomain,
    projectId: import.meta.env.VITE_RADA_projectId,
    storageBucket: import.meta.env.VITE_RADA_storageBucket,
    messagingSenderId: import.meta.env.VITE_RADA_messagingSenderId,
    appId: import.meta.env.VITE_RADA_appId,
};

// Initialize Firebase
let firebaseApp: FirebaseApp = getApps().find(app => app.name === 'rada') || initializeApp(firebaseConfig, 'rada');

// Export Database
export const db = getFirestore(firebaseApp)

// Export Authentication System
export const auth = getAuth(firebaseApp)