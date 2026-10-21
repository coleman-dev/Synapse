# Firebase integration

The existing authentication screens connect to project `synapse-59923`. Local SDK configuration is in the ignored `.env.local`. For another checkout, copy `.env.example` to `.env.local`, enter the Firebase Web app configuration, and restart Expo. Never put service-account keys in client environment variables.

Registration creates the Auth account, persists its session, and writes `users/{uid}` with `firstName`, `lastName`, `email`, and server-generated `createdAt`/`updatedAt` timestamps. A rejected profile write rolls back only the newly created Auth account; failure of that compensation is reported explicitly. Auth and Firestore cannot share a transaction.

Remember me selects persistent or memory-only sign-in. Native sessions use AsyncStorage 2.2 through Firebase's native persistence adapter; browser sessions use local storage. Application code does not separately save passwords. The existing signed-in screen exposes sign-out.

Sign-up validation preserves the Figma policy: 15+ characters, uppercase and lowercase letters, a number, and a special character. Set the same policy in Firebase Authentication settings to enforce it for requests that bypass this UI. The [branded reset screen and shared email-action handler](password-reset.md) support password reset, email verification, and email recovery. Firebase's template action URL must point to the shared handler for email links to use it. Mobile Google OAuth remains outside this integration and still reports that it is unavailable.

## Firestore rules

`firestore.rules` permits authenticated users to get and update only their own profile, validates the fields and timestamps, and makes `createdAt` immutable. Profile listing/deletion, other users' documents, subcollections, and unrelated paths are denied.

After testing, deploy only the rules to the existing project:

```sh
npx firebase deploy --only firestore:rules --project synapse-59923
```

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npm run export:all
npx playwright install chromium
npm run test:e2e
npm run test:emulators
```

The design browser suite runs without Firebase on port 8081. The emulator suite requires Java 21+ on PATH and uses only `demo-synapse`. It starts Auth/Firestore on ports 9099/8080 and an isolated Expo browser server on port 8082. Emulator routing is opt-in and refuses real project IDs. CI runs both suites.

Backend tests verify registration, profile creation, password reset completion, rollback, owner access, cross-user/anonymous denial, schema validation, immutable timestamps, and native SDK persistence through the asynchronous storage interface. Browser tests verify persistent sessions and memory-only sessions through the existing screens.

See [verification results](firebase-verification.md) for live-project evidence and limits. Physical-device storage I/O and live email delivery need separate confirmation.
