import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { palettes, type Colors, type ThemeName } from './tokens';

export const THEME_STORAGE_KEY = '@synapse/theme';

type ThemeContextValue = {
  theme: ThemeName;
  colors: Colors;
  ready: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [preference, setPreference] = useState<ThemeName | null>(null);
  const [ready, setReady] = useState(false);
  const theme = preference ?? (systemTheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((value) => {
        if (mounted && (value === 'light' || value === 'dark')) setPreference(value);
      })
      .catch(() => {
        /* Storage can be disabled; the system appearance still works. */
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist only after hydration. This also serializes quick changes in React's effect order.
  useEffect(() => {
    if (ready && preference) {
      void AsyncStorage.setItem(THEME_STORAGE_KEY, preference).catch(() => {});
    }
  }, [preference, ready]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: palettes[theme],
        ready,
        toggleTheme: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
