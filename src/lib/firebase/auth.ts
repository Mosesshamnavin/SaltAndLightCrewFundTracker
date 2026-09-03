import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_USERS } from './firestore';

const ADMIN_EMAILS = ['admin@saltandlight.in', 'admin@gmail.com'];

export async function loginWithGoogle(): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }

    const email = fbUser.email || '';
    const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || email.split('@')[0],
      email: email,
      role: isAdminEmail ? 'admin' : 'user', // Any other gmail login is a 'user' (view-only)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, newProfile);
    return newProfile;
  }

  // Local demo fallback for Google sign-in
  return {
    id: 'user-google-' + Date.now(),
    name: 'Gmail User',
    email: 'member@gmail.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function loginWithFirebase(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  // 1. Strict demo credentials check
  if (
    normalizedEmail === 'user' ||
    normalizedEmail === 'user@2026' ||
    normalizedEmail === 'user@2026.com' ||
    normalizedEmail === 'user@slc.in'
  ) {
    if (trimmedPassword !== 'user@123' && trimmedPassword !== 'user2026') {
      throw new Error('Incorrect password for User account.');
    }
    return {
      id: 'demo-user-2026',
      name: 'Youth Member',
      email: 'user@2026',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (
    normalizedEmail === 'admin' ||
    normalizedEmail === 'admin@slc.in' ||
    normalizedEmail === 'admin@saltandlight.in' ||
    normalizedEmail === 'admin@2026'
  ) {
    if (trimmedPassword !== 'admin@123' && trimmedPassword !== 'admin2026') {
      throw new Error('Incorrect password for Admin account.');
    }
    return {
      id: 'demo-admin-1',
      name: 'Moses Sham Navin',
      email: 'admin@slc.in',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // 2. Firebase Authentication check
  if (isFirebaseConfigured && auth && db) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }

      const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail);
      const newProfile: UserProfile = {
        id: cred.user.uid,
        name: cred.user.displayName || email.split('@')[0],
        email: cred.user.email || email,
        role: isAdminEmail ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      return newProfile;
    } catch (e: any) {
      const code = e?.code;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found'
      ) {
        throw new Error('Invalid email or password.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email format.');
      }
      throw new Error(e?.message || 'Login failed. Invalid credentials.');
    }
  }

  // 3. Fallback: Reject any unknown credentials
  throw new Error('Invalid email or password. Please use valid credentials.');
}

export async function registerWithFirebase(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'user'
): Promise<UserProfile> {
  if (isFirebaseConfigured && auth && db) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const newProfile: UserProfile = {
      id: cred.user.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    return newProfile;
  }

  return {
    id: 'user-' + Date.now(),
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function logoutFromFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
}
