import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:8081',
    viewport: { width: 390, height: 844 },
    colorScheme: 'light',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx expo start --web --port 8081',
    url: 'http://127.0.0.1:8081',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      CI: '1',
      EXPO_NO_TELEMETRY: '1',
      // Browser tests must never create accounts in a configured Firebase project.
      EXPO_PUBLIC_FIREBASE_API_KEY: '',
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: '',
      EXPO_PUBLIC_FIREBASE_APP_ID: '',
    },
  },
});
