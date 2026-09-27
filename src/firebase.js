import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ── Paste your Firebase project config here ──────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCpkIgPEDa3V7s7AAYJFqFC9_V7ivBqUQs",
  authDomain:        "td-liquidations.firebaseapp.com",
  projectId:         "td-liquidations",
  storageBucket:     "td-liquidations.firebasestorage.app",
  messagingSenderId: "956079867330",
  appId:             "1:956079867330:web:848dfc7368c614553c825b",
};
// ─────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
