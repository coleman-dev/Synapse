# Authentication implementation record

Source: [Synapse · Authentication · Dark / Light](https://www.figma.com/design/C21O8hgVsl0aETMppP0ubX/?node-id=0-1). Inspected through the connected Figma MCP on October 21, 2026. The implementation uses fresh design context and renders of every screen, not previous exported screenshots.

The complete saved page has **319 layers**, indexed with parent relationships, types, names, and geometry in [figma-inspection.json](figma-inspection.json). Shared field and button properties were read directly from their instances because Code Connect points to `primitives`, which did not exist in this initially README-only repository. Their native implementations now live in `src/components/primitives.tsx`.

## Frame mapping

| Screen / route                       | Dark node | Light node |
| ------------------------------------ | --------- | ---------- |
| Welcome `/`                          | `5:2`     | `5:31`     |
| Create account `/sign-up`            | `5:7`     | `5:36`     |
| Sign in `/sign-in`                   | `5:15`    | `5:44`     |
| Password recovery `/forgot-password` | `5:23`    | `5:52`     |
| About `/about`                       | `50:118`  | `50:172`   |

All reference frames are 390 × 844. Content gutters are 28. Fields have 12-point corners, 44-point inputs, a 20-point label line, and an 8-point gap. Buttons are 54 high with 14-point corners. About mission cards use 18-point corners. Headings use Manrope Bold; body text uses Inter Regular, field labels/Google buttons use Inter Medium, and primary buttons use Inter Semi Bold. Font files are bundled through the Expo Google Fonts packages, so runtime does not require Google Fonts network access.

## Saved Figma colors

| Token      | Dark      | Light     |
| ---------- | --------- | --------- |
| background | `#080d24` | `#f3faf9` |
| surface    | `#111b36` | `#ffffff` |
| border     | `#293957` | `#c6dbdf` |
| text       | `#f4f7ff` | `#102c3d` |
| muted      | `#a7b5cd` | `#516b79` |
| accent     | `#38def3` | `#087f87` |
| primary    | `#38def3` | `#2456db` |
| onPrimary  | `#06182d` | `#ffffff` |

Error colors are additional implementation tokens for validation states; there were no error-state reference frames. Focus uses the saved accent token, pressed buttons use opacity feedback, loading controls show a spinner and block duplicate requests.

## Original assets and slots

| Local asset                             | Figma slot                        | Export / rendered size | Callsite                 |
| --------------------------------------- | --------------------------------- | ---------------------- | ------------------------ |
| `assets/brand/synapse-logo-welcome.png` | Welcome logo, `7:182` / `7:200`   | 580 × 580 / 290 × 290  | `BrandLogo` in Welcome   |
| `assets/brand/synapse-logo-header.png`  | Other screen headers, e.g. `5:14` | 88 × 88 / 44 × 44      | `BrandLogo` in `Screen`  |
| `assets/icons/google.svg`               | Welcome and Sign In Google G      | 20 × 20 / 20 × 20      | `Button`, Google variant |
| `assets/icons/recovery-lock.svg`        | Recovery icon, `7:352` / `7:377`  | 28 × 28 / 28 × 28      | Password Recovery        |

These files were downloaded unchanged from the asset URLs supplied by `get_design_context`. They are local runtime resources; no temporary Figma URLs remain in application code. The logos are the supplied blue/purple artwork, with no redrawing or recoloring. Browser checks verify loading and logo dimensions; all four asset types were visually checked in their design slots.

## Responsive and accessibility adaptations

The implementation preserves reference positions at 390 × 844 using normal flow rather than one flattened image or a canvas of absolutely positioned controls. It centers readable content on wider screens, scrolls on short screens, respects safe areas, avoids keyboard obstruction, and permits system text scaling. Native status bars and home indicators belong to the operating system; the decorative Figma home indicator and phone-corner clipping are not duplicated inside the app. Browser screenshots therefore show content without simulated device chrome.

Added controls are limited to the requested functionality: an accessible 44-point theme control in every header, About Us entry points, and password reveal controls. Text links have enlarged touch areas. Switch/checkbox states are exposed to native accessibility and web ARIA. Navigation transitions are disabled to keep the authentication experience calm.

## Validation and remaining work

- TypeScript strict checking and ESLint pass.
- Six unit tests cover password boundaries, required fields, confirmation mismatch, email validation, existing-account login rules, and safe Firebase error messages.
- Fourteen Playwright checks cover the full route flow, real controlled inputs, focus/visibility, unconfigured auth errors, theme storage/reload, all ten theme/screen layouts, narrow screens, and direct-link fallback navigation.
- Every screen/theme was visually compared with the freshly retrieved Figma render. Screenshots are in [implementation/](implementation/).
- Expo Doctor passes all 21 checks; Expo reports compatible SDK package versions.
- Production JavaScript bundles compile for iOS, Android, and web. This is a bundle check, not an installed native binary or physical-device test. Native keyboard, screen-reader, and device testing remain to be performed with Expo Go or development builds.
- Live Firebase operations and Google provider behavior cannot be verified until the owner's Firebase configuration is supplied. Mobile Google OAuth remains pending; web Google is wired to the Firebase SDK. No mock successful authentication is used.
- npm audit reports remaining upstream advisories in the SDK 57 tooling dependency tree (notably `node-forge`, `braces`, and `decode-uri-component`). The patched compatible gRPC override removes the Firebase/Firestore gRPC advisory. npm's suggested Expo downgrade would break the supported SDK stack; it was not applied. Recheck upstream patches before a production release.

Setup references: [Expo project creation](https://docs.expo.dev/get-started/create-a-project/), [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Firebase with Expo](https://docs.expo.dev/guides/using-firebase/), and [Firebase password authentication](https://firebase.google.com/docs/auth/web/password-auth).
