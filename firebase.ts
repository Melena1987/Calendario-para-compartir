// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0QfHaRIx8XRxsrunx8N3S54RpkWZxBnc",
  authDomain: "calendario-visual.firebaseapp.com",
  projectId: "calendario-visual",
  storageBucket: "calendario-visual.firebasestorage.app",
  messagingSenderId: "627610160323",
  appId: "1:627610160323:web:dc401170d0f5553304e676"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
