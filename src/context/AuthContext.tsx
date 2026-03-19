import React, { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase-client";

interface MongoUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  isAdmin: boolean;
  assignedClassId?: string | null;
  isSuperAdmin: boolean;
}

interface AuthContextType {
  user: MongoUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const response = await fetch("/api/auth/login", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            });
            if (!response.ok) {
              throw new Error(`Login API returned ${response.status}`);
            }
            const { user: mongoUser }: { user: MongoUser } = await response.json();
            setUser(mongoUser);
          } catch (err) {
            console.error("Failed to fetch user from /api/auth/login:", err);
            setUser(null);
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
    setUser(null);
    setError(null);
  };

  const getIdToken = async (): Promise<string | null> => {
    return auth.currentUser?.getIdToken() ?? null;
  };

  const value: AuthContextType = {
    user,
    isAdmin: user?.isAdmin ?? false,
    isSuperAdmin: user?.isSuperAdmin ?? false,
    loading,
    error,
    signInWithGoogle,
    signOut,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
