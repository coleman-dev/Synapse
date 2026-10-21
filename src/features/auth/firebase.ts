import { browserLocalPersistence, getAuth } from 'firebase/auth';

import { firebaseApp } from './firebase-config';

export const persistentSession = browserLocalPersistence;
export function configuredAuth() {
  return getAuth(firebaseApp());
}
