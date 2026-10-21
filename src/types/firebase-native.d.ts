import type { Persistence } from 'firebase/auth';

// Firebase exports this only in its react-native runtime entry point. The default
// TypeScript entry point describes the browser build, so declare the native API.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
