# Synapse

Synapse is a capstone project exploring how a mobile application can help people document symptoms, follow clinician-directed recovery activities, recognize patterns over time, and communicate a clearer history between appointments. The experience is designed around neurological injury and vestibular/dizziness recovery, where symptoms and day-to-day progress can be difficult to recall or describe.

Sprint 1 implements the saved [Figma authentication designs](https://www.figma.com/design/C21O8hgVsl0aETMppP0ubX/?node-id=0-1) as native React Native screens: Welcome, Create Account, Sign In, Password Recovery, and About Us, in light and dark modes.

## Run the app

Use Node.js 24 LTS and npm. The app uses Expo SDK 57 (the supported Expo Go version at implementation), React Native 0.86, TypeScript, and Expo Router. Versions are locked in `package-lock.json`.

```sh
npm ci
npm start
```

Scan the QR code with Expo Go on your phone. Press `a` for an installed Android emulator or `w` for web. Local iOS simulator builds require macOS. `npm run web` starts the browser version directly.

The first launch follows the device appearance. The theme control in each header switches modes and saves your choice. About Us is reachable from Welcome and from the logo on the other authentication screens. Fields support validation, keyboard progression, autofill, and password visibility controls.

## Connect Firebase

The Firebase adapter is implemented; the owner's project configuration is pending. The app runs without it and displays an honest unavailable message on a valid submission. It never simulates account creation, sign-in, or reset email delivery.

1. Copy `.env.example` to `.env` and fill in the Firebase **Web app** SDK configuration from Project settings.
2. Enable Email/Password in Firebase Authentication. Set the server-side password policy to match the Figma requirements: 15+ characters, uppercase, lowercase, number, and a special character.
3. Restart Expo (`npx expo start --clear`) after changing environment variables.
4. For web Google sign-in, enable Google in Firebase Authentication and add the deployed website's domain (and localhost for development) to Authorized domains.

Email/password creation, sign-in, password reset, session observation, and sign-out call the real Firebase SDK. Remember me selects persistent versus memory-only authentication; passwords are never saved by application code. A successful login displays an account confirmation with sign-out, ready for the next sprint's recovery home screen.

**Mobile Google OAuth remains pending.** It needs platform client registration and a native Google sign-in integration/development build once the Firebase project is supplied. The button reports this rather than pretending to authenticate. Firebase's hosted email action handler completes password resets. Terms and Privacy are the supplied Figma copy; policy documents have not been provided.

Client Firebase identifiers are public configuration, not server credentials. Never add service-account keys or admin credentials to an `EXPO_PUBLIC_` variable. `.env` files are ignored by Git.

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
```

The browser suite starts its own unconfigured Expo server on port 8081, validates navigation, input behavior, theme persistence, direct links, and small viewports, and captures all ten screen/theme combinations in `docs/design/implementation/`. It deliberately disables Firebase configuration so tests cannot write to a real project. CI runs the same core checks and production exports.

See [design provenance and validation](docs/design/README.md) for frame mappings, exact tokens, assets, and test limitations.

## Structure

```text
src/app/             Expo Router routes and root providers
src/components/      Shared screen shell, logo, buttons, inputs, typography, notices
src/theme/           Figma tokens and persisted theme context
src/features/auth/   Validation, Firebase adapter, session context, request/error handling
assets/              Original Figma-exported brand and icon files
tests/               Unit and browser interaction checks
docs/design/         Saved layer inventory and implementation screenshots
```
