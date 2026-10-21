# Branded password reset and shared email actions

## Designs

Added editable dark/light reset and success frames to the existing [Synapse Figma file](https://www.figma.com/design/C21O8hgVsl0aETMppP0ubX/?node-id=56-146). They reuse the existing fields, buttons, theme variables, Manrope/Inter typography, logo, and lock icon. Reset buttons navigate to the matching success frame in the Figma prototype.

The app uses the same shared native components, scroll/keyboard handling, and theme system. The checklist displays the 15-character minimum, uppercase/lowercase letters, number/special character, and a different current password. Password confirmation must match.

## Shared handler URL

Enter this exact URL in Firebase Authentication → Templates → Customize action URL:

```text
https://synapse-59923.web.app/email-action
```

Firebase appends `mode` and `oobCode`. This setting is shared by email templates, so the handler supports all three required modes:

| Mode | Behavior |
| --- | --- |
| `resetPassword` | Routes to the branded reset screen, validates the token, checks password strength/reuse, then calls `confirmPasswordReset`. |
| `verifyEmail` | Checks that the token is specifically for email verification, then applies it only after the user confirms. |
| `recoverEmail` | Checks that the token is specifically for email recovery, then restores the previous email only after the user confirms. Offers password recovery afterwards. |

Missing/unknown modes, missing/invalid tokens, expired tokens, mode/token mismatches, and consumed tokens show an error without applying an action. Loading a link alone does not consume verification/recovery codes. Query-provided API keys and continue URLs are not trusted: the app uses its configured Firebase project and its own navigation destinations.

`/reset-password` remains a supported direct entry point. Non-reset modes received there route back to the shared handler.

The current-password reuse check uses a separate, memory-only Firebase Auth instance. It does not replace the main app session or save password history. This prevents current-password reuse through this app flow; it is not a server-wide password-history policy for other clients using Firebase APIs directly.

## Deployment and configuration status

The Expo web export is hosted on the existing `synapse-59923` Firebase Hosting site. No existing site content was replaced: the site returned Firebase's default 404 before the first deployment. The handler is served with a no-referrer policy and no-store caching.

The attempted narrow configuration update to `notification.sendEmail.callbackUri` returned HTTP 400 `EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`. The callback remained on Firebase's built-in handler at that check. Deployment of the page does not change email links by itself. The owner is reviewing the Console change and should use the shared `/email-action` URL above.

The same backend error has been reported for Firebase Console saves in [firebase-tools issue #10188](https://github.com/firebase/firebase-tools/issues/10188); a Firebase maintainer directs affected users to [Firebase Support](https://firebase.google.com/support). The API rejection does not prove that this project's Console save will fail, but the Console can encounter the same restriction. If it does, contact Support with the project ID, exact desired callback URL, and error. Do not change billing, projects, or email providers just to work around this error without a separate decision.

## Verification

- TypeScript and ESLint pass.
- Six backend emulator tests pass, including actual Firebase password reset, reuse rejection without consuming the token, and session persistence.
- Five browser emulator tests pass. They exercise all three action modes end to end, verify the email-verified flag and restored email, reject mismatched modes/used codes, and confirm login with the new password while rejecting the old password.
- Existing unit tests and 14 design/navigation checks pass.
- Android, iOS, and web production exports pass.
- Live Hosting checks passed: real reset and verification tokens were validated without consumption; the recovery route rejected an invalid token; unknown modes produced a safe error. No live user properties were changed. Successful email restoration was tested in the emulator, not by changing the owner's live account.
- Native physical-device smoke testing remains separate from these browser/emulator checks.
