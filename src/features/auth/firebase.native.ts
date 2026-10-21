import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { firebaseApp } from './firebase-config';
import { connectConfiguredAuthEmulator } from './emulators';

export const persistentSession = getReactNativePersistence(AsyncStorage);
let auth: Auth | undefined;
export function configuredAuth() {
  if (auth) return auth;
  const app = firebaseApp();
  try {
    auth = initializeAuth(app, { persistence: persistentSession });
  } catch (error) {
    // Fast Refresh can reload this module while Firebase retains the Auth instance.
    if (!(error instanceof FirebaseError) || error.code !== 'auth/already-initialized') throw error;
    auth = getAuth(app);
  }
  connectConfiguredAuthEmulator(auth);
  return auth;
}
