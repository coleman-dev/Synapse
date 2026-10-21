import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Heading, Notice, TextLink } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { completeEmailAction, validateEmailAction, type EmailActionMode } from '@/features/auth/email-action';
import { authError } from '@/features/auth/errors';
import { configuredAuth } from '@/features/auth/firebase';
import { useAuthAction } from '@/features/auth/useAuthAction';
import { useTheme } from '@/theme/ThemeProvider';

export default function EmailActionScreen() {
  const params = useLocalSearchParams<{ mode?: string | string[]; oobCode?: string | string[] }>();
  const mode = typeof params.mode === 'string' ? params.mode : '';
  const code = typeof params.oobCode === 'string' ? params.oobCode : '';
  if (mode === 'resetPassword')
    return <Redirect href={{ pathname: '/reset-password', params: { mode, oobCode: code } }} />;
  if ((mode !== 'verifyEmail' && mode !== 'recoverEmail') || !code)
    return <Screen title="Account action" fallback="/sign-in">
      <View style={styles.heading}><Heading eyebrow="YOUR SYNAPSE ACCOUNT" title="Let’s try that again." description="This account link is incomplete or unsupported. Open the latest link from your email." /></View>
      <TextLink onPress={() => router.replace('/sign-in')}>Back to sign in</TextLink>
    </Screen>;
  return <ConfirmEmailAction key={`${mode}:${code}`} mode={mode} code={code} />;
}

function ConfirmEmailAction({ mode, code }: { mode: EmailActionMode; code: string }) {
  const { colors } = useTheme();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string>();
  const action = useAuthAction();
  const recovery = mode === 'recoverEmail';
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await validateEmailAction(configuredAuth(), mode, code);
      } catch (failure) {
        if (active) setError(authError(failure));
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [mode, code]);
  const title = action.success ? (recovery ? 'Email restored.' : 'Email verified.')
    : (recovery ? 'Secure your account.' : 'Confirm your email.');
  const description = action.success
    ? (recovery ? 'Your previous email address is restored. Reset your password next to secure your account.' : 'Your email address is verified. You’re ready to reconnect with Synapse.')
    : (recovery ? 'Restore the previous email address on your Synapse account. Only continue if you requested this recovery.' : 'Verify your email address to keep your Synapse account connected.');
  return <Screen title="Account action" fallback="/sign-in">
    <View style={[styles.icon, { backgroundColor: colors.surface }]}>
      <Image source={require('../../assets/icons/recovery-lock.svg')} style={{ width: 28, height: 28 }} contentFit="contain" accessibilityElementsHidden />
    </View>
    <View style={styles.heading}><Heading recovery eyebrow="YOUR SYNAPSE ACCOUNT" title={title} description={description} /></View>
    {checking && <ActivityIndicator accessibilityLabel="Checking email link" color={colors.accent} style={styles.actions} />}
    <Notice message={error ?? action.message} />
    {!checking && !error && !action.success && <Button style={styles.actions} loading={action.loading}
      onPress={() => void action.run(() => completeEmailAction(configuredAuth(), mode, code))}>
      {recovery ? 'Restore email' : 'Verify email'}
    </Button>}
    {action.success && recovery && <Button style={styles.actions} onPress={() => router.replace('/forgot-password')}>Reset your password</Button>}
    <TextLink style={{ marginTop: 16 }} onPress={() => router.replace('/sign-in')}>Back to sign in</TextLink>
  </Screen>;
}

const styles = StyleSheet.create({
  icon: { marginTop: 58, width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading: { marginTop: 24 },
  actions: { marginTop: 24 },
});
