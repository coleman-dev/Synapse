import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  inMemoryPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { configuredAuth, persistentSession } from './firebase';
import { firebaseApp } from './firebase-config';
import { connectConfiguredFirestoreEmulator } from './emulators';
import { registerAccount } from './registration';
import type { SignUpValues } from './validation';

export async function createAccount(values: SignUpValues) {
  const auth = configuredAuth();
  await setPersistence(auth, persistentSession);
  const db = getFirestore(firebaseApp());
  connectConfiguredFirestoreEmulator(db);
  await registerAccount(auth, db, values);
}

export async function signIn(email: string, password: string, remember: boolean) {
  const auth = configuredAuth();
  await setPersistence(auth, remember ? persistentSession : inMemoryPersistence);
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function recoverPassword(email: string) {
  await sendPasswordResetEmail(configuredAuth(), email.trim());
}

export async function signInGoogle(remember = false) {
  const auth = configuredAuth();
  if (Platform.OS !== 'web') {
    throw new Error(
      'Google sign-in is not available on mobile yet. Please use email and password.',
    );
  }
  // Firebase owns the OAuth window and credential exchange on web.
  await setPersistence(auth, remember ? persistentSession : inMemoryPersistence);
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function endSession() {
  await signOut(configuredAuth());
}
