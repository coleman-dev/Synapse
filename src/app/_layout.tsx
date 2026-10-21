import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Button as NativeButton, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppNavigation() {
  const { theme, colors, ready } = useTheme();
  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Manrope_700Bold,
  });
  useEffect(() => {
    if ((loaded || fontError) && ready) void SplashScreen.hideAsync();
  }, [loaded, fontError, ready]);
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
  }, [colors.background]);
  if (!ready || (!loaded && !fontError)) return null;
  const base = theme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <NavigationThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }}
    >
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Welcome | Synapse' }} />
          <Stack.Screen name="sign-up" options={{ title: 'Create account | Synapse' }} />
          <Stack.Screen name="sign-in" options={{ title: 'Sign in | Synapse' }} />
          <Stack.Screen name="forgot-password" options={{ title: 'Password recovery | Synapse' }} />
          <Stack.Screen name="about" options={{ title: 'About | Synapse' }} />
        </Stack>
      </AuthProvider>
    </NavigationThemeProvider>
  );
}

export function ErrorBoundary({ retry }: { retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 16 }}>
      <Text accessibilityRole="alert">Synapse could not load this screen. Please try again.</Text>
      <NativeButton title="Try again" onPress={retry} />
    </View>
  );
}
