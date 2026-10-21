import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';
import { initializeApp, deleteApp } from 'firebase/app';

// Load the installed SDK's actual native runtime, which Metro selects on devices.
const require = createRequire(import.meta.url);
const nativeAuth = require(path.join(
  path.dirname(require.resolve('@firebase/auth/package.json')), 'dist/rn/index.js',
)) as typeof import('firebase/auth');

test('native SDK AsyncStorage persistence restores the user and clears on sign-out', async () => {
  // Implements the same asynchronous contract as the installed AsyncStorage 2.2.
  // Device I/O still needs a physical-device or simulator smoke test.
  const stored = new Map<string, string>();
  const storage = {
    async getItem(key: string) { return stored.get(key) ?? null; },
    async setItem(key: string, value: string) { stored.set(key, value); },
    async removeItem(key: string) { stored.delete(key); },
  };
  const persistence = nativeAuth.getReactNativePersistence(storage);
  function open() {
    const app = initializeApp({ projectId: 'demo-synapse', apiKey: 'demo-key' }, 'native-persistence');
    const auth = nativeAuth.initializeAuth(app, { persistence });
    nativeAuth.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    return { app, auth };
  }
  let session = open();
  try {
    const { user } = await nativeAuth.createUserWithEmailAndPassword(
      session.auth, `native-${Date.now()}@example.com`, 'SynapseTesting2026!',
    );
    assert.ok([...stored.values()].some((value) => value.includes(user.uid)));
    await deleteApp(session.app);
    session = open();
    await session.auth.authStateReady();
    assert.equal(session.auth.currentUser?.uid, user.uid);
    await nativeAuth.signOut(session.auth);
    await deleteApp(session.app);
    session = open();
    await session.auth.authStateReady();
    assert.equal(session.auth.currentUser, null);
  } finally { await deleteApp(session.app); }
});
