import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For your tickets and rooms
import { getAuth } from "firebase/auth";           // For RBAC login
import { getStorage } from "firebase/storage";     // For defect photos

const firebaseConfig = {
    apiKey: "AIzaSyAou-P0OKYlET3RQW4hldRf2kjDhxlch-k",
    authDomain: "tutorondemand-44b63.firebaseapp.com",
    projectId: "tutorondemand-44b63",
    storageBucket: "tutorondemand-44b63.firebasestorage.app",
    messagingSenderId: "136256401282",
    appId: "1:136256401282:web:b6e711ae600092623ca99b",
    measurementId: "G-S0Z4T0QVLW"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Firebase Analytics is disabled to prevent blocking by ad-blockers
// Analytics is not required for core BSM functionality
console.log('Firebase Analytics disabled to prevent ad-blocker issues');

// Export essential Firebase services for BSM
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);