
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// It's recommended to store this configuration in environment variables
// and access them using import.meta.env.VITE_... for Vite projects.
// Create a .env.local file in the root of your project with these keys from your Firebase Console.
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// Validate that the config values are present to avoid runtime errors
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Enable Firestore offline persistence
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence.');
        }
      });

  } catch (error) {
    console.error("Error initializing Firebase:", error);
    // On error, ensure services are null so the app can show a friendly error.
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.error(
    "Firebase config is missing. " +
    "Please create a .env.local file in the project root " +
    "and add your Firebase project configuration. Refer to the Firebase setup instructions."
  );
}

export { app, auth, db };
