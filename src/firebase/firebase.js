// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Konfigurasi Firebase Anda
export const firebaseConfig = {
    apiKey: "AIzaSyBFrYcwWKfN9zLepg0P3tlFNmlLP7TDSMw",
    authDomain: "solar-ce53e.firebaseapp.com",
    databaseURL: "https://solar-ce53e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "solar-ce53e",
    storageBucket: "solar-ce53e.firebasestorage.app",
    messagingSenderId: "499406911147",
    appId: "1:499406911147:web:5970d609596a6357fc29ee"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);  // Ekspor bernama