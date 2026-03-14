import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!apiKey) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!authDomain) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
}
if (!projectId) {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
