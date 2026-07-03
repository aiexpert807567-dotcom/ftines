import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqeSkuKoH2Gz37FHPbm_L8PjDPGQEiIH4",
  authDomain: "gen-lang-client-0303744097.firebaseapp.com",
  projectId: "gen-lang-client-0303744097",
  storageBucket: "gen-lang-client-0303744097.firebasestorage.app",
  messagingSenderId: "406451938298",
  appId: "1:406451938298:web:ee2a19cef0fbc78221fa43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Initialize Firestore with custom database ID
export const db = getFirestore(app, "ai-studio-fitgenai-ed3cd91c-b38a-40a5-a6cf-f01996a4f0d8");

export { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
};
export type { FirebaseUser };
