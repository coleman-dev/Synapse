export function authError(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'The email or password is incorrect. Please try again.',
    'auth/user-not-found': 'The email or password is incorrect. Please try again.',
    'auth/wrong-password': 'The email or password is incorrect. Please try again.',
    'auth/email-already-in-use': 'An account already uses this email. Try signing in instead.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password that meets the requirements below.',
    'auth/password-does-not-meet-requirements':
      'Choose a password that meets the requirements below.',
    'auth/network-request-failed': 'Could not connect. Check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a little and try again.',
    'auth/user-disabled': 'This account is unavailable. Please contact your account administrator.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled. You can try again.',
    'auth/popup-blocked': 'Allow the Google sign-in window in your browser and try again.',
    'auth/operation-not-allowed':
      'This sign-in method is not available yet. Please try again later.',
    'auth/unauthorized-domain': 'Google sign-in is not available on this website yet.',
  };
  if (code) return messages[code] ?? 'Something went wrong. Please try again.';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
