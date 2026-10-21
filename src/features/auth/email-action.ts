import { FirebaseError } from 'firebase/app';
import { ActionCodeOperation, applyActionCode, checkActionCode, type Auth } from 'firebase/auth';

export type EmailActionMode = 'verifyEmail' | 'recoverEmail';

export async function validateEmailAction(auth: Auth, mode: EmailActionMode, code: string) {
  const info = await checkActionCode(auth, code);
  const expected = mode === 'verifyEmail' ? ActionCodeOperation.VERIFY_EMAIL : ActionCodeOperation.RECOVER_EMAIL;
  if (info.operation !== expected) throw new FirebaseError('auth/invalid-action-code', 'The action does not match this link.');
  return info;
}

export async function completeEmailAction(auth: Auth, mode: EmailActionMode, code: string) {
  await validateEmailAction(auth, mode, code);
  await applyActionCode(auth, code);
}
