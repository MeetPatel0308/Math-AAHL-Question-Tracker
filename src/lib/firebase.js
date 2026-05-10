import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyByWoIG0acQjLu7CVlIQiz2GbggiN1FH2E",
  authDomain: "meet-questiontracker.firebaseapp.com",
  projectId: "meet-questiontracker",
  storageBucket: "meet-questiontracker.firebasestorage.app",
  messagingSenderId: "836017845629",
  appId: "1:836017845629:web:ea5ec57674a83f91f6c814",
  measurementId: "G-BPBF2JEXNB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
