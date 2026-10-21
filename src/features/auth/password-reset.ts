import { deleteApp, FirebaseError, initializeApp } from 'firebase/app';
import {
  confirmPasswordReset, connectAuthEmulator, initializeAuth, inMemoryPersistence,
  signInWithEmailAndPassword, signOut, verifyPasswordResetCode, type Auth,
} from 'firebase/auth';
import { passwordError } from './validation';

export async function resetPassword(auth: Auth, code: string, password: string) {
  const validation = passwordError(password);
  if (validation) throw new Error(validation);
  const email = await verifyPasswordResetCode(auth, code);
  // A separate, memory-only Auth instance checks reuse without replacing the
  // app's current user or writing the candidate password to device storage.
  const app = initializeApp(auth.app.options, `password-reset-${Date.now()}-${Math.random()}`);
  try {
    const probe = initializeAuth(app, { persistence: inMemoryPersistence });
    if (auth.emulatorConfig) {
      const { protocol, host, port } = auth.emulatorConfig;
      connectAuthEmulator(probe, `${protocol}://${host}:${port}`, { disableWarnings: true });
    }
    let reused = false;
    try {
      await signInWithEmailAndPassword(probe, email, password);
      reused = true;
    } catch (error) {
      const code = error instanceof FirebaseError ? error.code : '';
      if (code === 'auth/multi-factor-auth-required') reused = true;
      else if (!['auth/invalid-credential', 'auth/wrong-password'].includes(code)) throw error;
    }
    if (reused) throw new FirebaseError('auth/password-reused', 'Choose a different password.');
  } finally {
    await deleteApp(app);
  }
  await confirmPasswordReset(auth, code, password);
  if (auth.currentUser?.email?.toLowerCase() === email.toLowerCase()) await signOut(auth);
}
