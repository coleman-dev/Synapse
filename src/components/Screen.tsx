import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Copy, TextLink } from './primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { layout } from '@/theme/tokens';

export function backOr(fallback: Href = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

export function BrandLogo({ welcome = false }: { welcome?: boolean }) {
  return (
    <Image
      source={
        welcome
          ? require('../../assets/brand/synapse-logo-welcome.png')
          : require('../../assets/brand/synapse-logo-header.png')
      }
      accessibilityLabel="Synapse logo"
      contentFit="contain"
      style={{
        width: welcome ? layout.welcomeLogo : layout.headerLogo,
        height: welcome ? layout.welcomeLogo : layout.headerLogo,
        maxWidth: '100%',
      }}
    />
  );
}

export function Screen({
  children,
  welcome = false,
  fallback = '/',
  title,
}: PropsWithChildren<{
  welcome?: boolean;
  fallback?: Href;
  title: string;
}>) {
  const { colors, theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.scroll}
      >
        <View
          accessibilityLabel={title}
          style={[
            styles.canvas,
            {
              paddingTop: Math.max(29, insets.top + 8),
              paddingBottom: Math.max(28, insets.bottom + 12),
            },
          ]}
        >
          <View style={styles.header}>
            {welcome ? (
              <TextLink onPress={() => router.push('/about')} align="left">
                About us
              </TextLink>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => backOr(fallback)}
                style={styles.back}
              >
                <Copy style={{ fontSize: 24, lineHeight: 35 }}>←</Copy>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="switch"
              accessibilityLabel="Dark mode"
              accessibilityState={{ checked: theme === 'dark' }}
              aria-checked={theme === 'dark'}
              accessibilityHint={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              onPress={toggleTheme}
              style={[styles.theme, { borderColor: colors.border }]}
            >
              <Copy style={{ color: colors.accent, fontSize: 11 }}>
                {theme === 'dark' ? 'Light' : 'Dark'}
              </Copy>
            </Pressable>
            {!welcome && (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="About Synapse"
                onPress={() => router.push('/about')}
              >
                <BrandLogo />
              </Pressable>
            )}
          </View>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  canvas: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 46,
  },
  back: { width: 44, minHeight: 44, justifyContent: 'center' },
  theme: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
