import { browserLocalPersistence, getAuth } from 'firebase/auth';

import { firebaseApp } from './firebase-config';
import { connectConfiguredAuthEmulator } from './emulators';

export const persistentSession = browserLocalPersistence;
export function configuredAuth() {
  const auth = getAuth(firebaseApp());
  connectConfiguredAuthEmulator(auth);
  return auth;
}
