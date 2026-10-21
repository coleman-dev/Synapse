# Sprint 1 Firebase verification

Verified on October 21, 2026 against existing project `synapse-59923`.

## Live project

- Deployed `firestore.rules` with Firebase CLI; server compilation and release succeeded.
- Registered the owner's authorized test email through the existing Create Account screen.
- Independently signed in against Firebase Authentication to confirm UID `AB0vTRwGSNPs4AgckHMzhWoOQpJ3`.
- Read `users/AB0vTRwGSNPs4AgckHMzhWoOQpJ3` from Firestore and checked first name, last name, email, and both server timestamps.
- Verified registration session restoration after a browser reload.
- Verified sign-out and signed-out state after reload, then sign-in with Remember me and session restoration after reload.
- Verified deployed rules deny cross-user document reads/writes, collection listing, and unauthenticated reads of the test profile.
- Submitted password recovery through the existing screen; Firebase accepted the request. Inbox receipt and completion of the live reset link were not verified.
- Used a generated app test password held only in process memory. The email account password was never requested or used. The test account remains available through password recovery.

## Repeatable local coverage

`npm test` covers the 15-character boundary and each required character class, validation, and safe error messages.

`npm run test:emulators` runs six backend tests and two browser tests against `demo-synapse`, including owner access, cross-user/anonymous denial, schema and timestamp restrictions, account/profile creation, rollback after a rejected profile write, reset-link completion, persistent browser sessions, memory-only sessions, and native Firebase persistence with an asynchronous storage adapter.

Native persistence was verified using the installed SDK's native runtime and the AsyncStorage interface, rather than a physical device's storage. A device restart smoke test remains outstanding.

## Check results

- TypeScript and ESLint: passed.
- Unit tests: 6 passed.
- Backend emulator tests: 6 passed.
- Firebase browser tests: 2 passed.
- Existing design/navigation browser tests: 14 passed, including both themes and small screens.
- Expo dependency compatibility: passed.
- Expo Doctor: 21/21 checks passed.
- Production exports: Android, iOS, and web passed.
- Git whitespace check: passed.

The existing Figma screen layouts, assets, theme tokens, and navigation destinations were preserved. The sign-in screen waits for the initial Auth state before showing its existing form or signed-in content.
