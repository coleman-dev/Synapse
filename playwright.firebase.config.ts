import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/firebase-e2e', workers: 1, timeout: 45_000,
  use: {
    baseURL: 'http://127.0.0.1:8082',
    viewport: { width: 390, height: 844 }, trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx expo start --web --port 8082',
    url: 'http://127.0.0.1:8082', reuseExistingServer: false, timeout: 120_000,
    env: {
      CI: '1', EXPO_NO_TELEMETRY: '1',
      EXPO_PUBLIC_FIREBASE_USE_EMULATORS: 'true',
      EXPO_PUBLIC_FIREBASE_API_KEY: 'demo-key',
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: 'demo-synapse.firebaseapp.com',
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: 'demo-synapse',
      EXPO_PUBLIC_FIREBASE_APP_ID: 'demo-app',
    },
  },
});
