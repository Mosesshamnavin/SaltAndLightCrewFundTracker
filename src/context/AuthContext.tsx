'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/firebase/firestore';
import {
  loginWithFirebase,
  loginWithGoogle,
  registerWithFirebase,
  logoutFromFirebase,
} from '@/lib/firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  availableDemoUsers: UserProfile[];
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'sl_fund_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved user in storage
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Map legacy roles to 'user'
        if (parsed.role !== 'admin') {
          parsed.role = 'user';
        }
        setUser(parsed);
      }
    } catch {
      // ignore
    }

    if (isFirebaseConfigured && auth && db) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              setUser(userDoc.data() as UserProfile);
            } else {
              const isAdminEmail = fbUser.email === 'admin@saltandlight.in';
              const userProfile: UserProfile = {
                id: fbUser.uid,
                name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
                email: fbUser.email || '',
                role: isAdminEmail ? 'admin' : 'user', // Any other gmail login is a 'user'
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUser(userProfile);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
          }
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await loginWithFirebase(email, pass);
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle();
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const profile = await registerWithFirebase(email, pass, name, 'user');
      setUser(profile);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutFromFirebase();
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const demoUser = INITIAL_USERS.find((u) => u.role === targetRole) || INITIAL_USERS[0];
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    }
  };

  const role: UserRole = user?.role === 'admin' ? 'admin' : 'user';
  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isAdmin,
        isUser,
        isLoading,
        login,
        loginWithGoogle: handleGoogleLogin,
        register,
        logout,
        switchDemoRole,
        availableDemoUsers: INITIAL_USERS,
        isFirebaseActive: isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
