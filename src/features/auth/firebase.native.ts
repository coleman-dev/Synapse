import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { firebaseApp } from './firebase-config';

export const persistentSession = getReactNativePersistence(AsyncStorage);
let auth: Auth | undefined;
export function configuredAuth() {
  auth ??= initializeAuth(firebaseApp(), { persistence: persistentSession });
  return auth;
}
