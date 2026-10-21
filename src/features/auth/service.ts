import { Platform } from 'react-native';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  inMemoryPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { configuredAuth, persistentSession } from './firebase';
import type { SignUpValues } from './validation';

export async function createAccount(values: SignUpValues) {
  const auth = configuredAuth();
  await setPersistence(auth, inMemoryPersistence);
  const { user } = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
  // Account creation has already succeeded even if a profile update is interrupted.
  try {
    await updateProfile(user, {
      displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
    });
  } catch {
    /* A missing display name must not encourage creating the account twice. */
  }
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
