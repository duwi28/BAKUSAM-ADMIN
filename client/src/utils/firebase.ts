// src/firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
// Jika Anda akan menggunakan Autentikasi:
// import { getAuth, Auth } from "firebase/auth";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyA8tc9qZ2MsF7BSyOF0ITZtiUj0liaV9U0", // <-- Ganti dengan apiKey Anda
  authDomain: "bakusam-driverappandadmin.firebaseapp.com", // <-- Ganti dengan authDomain Anda
  projectId: "bakusam-driverappandadmin", // <-- Ganti dengan projectId Anda
  storageBucket: "bakusam-driverappandadmin.firebasestorage.app",
  messagingSenderId: "59767282564",
  appId: "1:59767282564:web:e6f8f4f03f92c158c81bd1",
};

// Inisialisasi Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// Dapatkan instance layanan Firestore
export const db: Firestore = getFirestore(app);
// Jika Anda akan menggunakan Autentikasi:
// export const auth: Auth = getAuth(app);

// Anda juga bisa mengekspor 'app' jika diperlukan di tempat lain,
// tapi biasanya 'db' dan 'auth' yang paling sering diakses.
// export { app };
