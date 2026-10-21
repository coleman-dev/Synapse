import { connectAuthEmulator, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, type Firestore } from 'firebase/firestore';

export function connectConfiguredAuthEmulator(auth: Auth) {
  if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS !== 'true') return;
  if (auth.app.options.projectId !== 'demo-synapse')
    throw new Error('Emulator mode requires the demo-synapse project.');
  if (!auth.emulatorConfig)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}

const connected = new WeakSet<Firestore>();
export function connectConfiguredFirestoreEmulator(db: Firestore) {
  if (process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS !== 'true' || connected.has(db)) return;
  if (db.app.options.projectId !== 'demo-synapse')
    throw new Error('Emulator mode requires the demo-synapse project.');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connected.add(db);
}
