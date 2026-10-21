import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { verifyPasswordResetCode } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';

import { Button, Copy, Eyebrow, Heading, InputField, Notice, TextLink } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { configuredAuth } from '@/features/auth/firebase';
import { authError } from '@/features/auth/errors';
import { resetPassword } from '@/features/auth/password-reset';
import { useAuthAction } from '@/features/auth/useAuthAction';
import { passwordError } from '@/features/auth/validation';
import { useTheme } from '@/theme/ThemeProvider';
import { layout } from '@/theme/tokens';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ oobCode?: string | string[]; mode?: string | string[] }>();
  const code = typeof params.oobCode === 'string' ? params.oobCode : '';
  const mode = typeof params.mode === 'string' ? params.mode : 'resetPassword';
  if (mode !== 'resetPassword') return <Redirect href={{ pathname: '/email-action', params: { mode, oobCode: code } }} />;
  return <ResetPasswordForm key={`${mode}:${code}`} code={code} mode={mode} />;
}

function ResetPasswordForm({ code, mode }: { code: string; mode: string }) {
  const { colors } = useTheme();
  const [checking, setChecking] = useState(true);
  const [linkError, setLinkError] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirmation?: string }>({});
  const confirmRef = useRef<TextInput>(null);
  const action = useAuthAction();
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        if (!code || mode !== 'resetPassword')
          throw new Error('Open the reset link from your email, or request a new link below.');
        await verifyPasswordResetCode(configuredAuth(), code);
      } catch (error) {
        if (active) setLinkError(authError(error));
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => { active = false; };
  }, [code, mode]);
  function submit() {
    const next = {
      password: passwordError(password),
      confirmation: password && password === confirmation ? undefined : 'Passwords must match.',
    };
    setErrors(next);
    if (next.password || next.confirmation || checking || linkError) return;
    void action.run(async () => {
      await resetPassword(configuredAuth(), code, password);
      setPassword('');
      setConfirmation('');
    });
  }
  const rules = [
    { text: 'At least 15 characters', met: password.length >= 15 },
    { text: 'Uppercase + lowercase letters', met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { text: 'A number + a special character', met: /[0-9]/.test(password) && /[^A-Za-z0-9\s]/.test(password) },
    { text: 'Different from your current password', met: false },
  ];
  return (
    <Screen title="Reset password" fallback="/sign-in">
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Image source={require('../../assets/icons/recovery-lock.svg')} style={{ width: 28, height: 28 }} contentFit="contain" accessibilityElementsHidden />
      </View>
      <View style={styles.heading}>
        <Heading recovery eyebrow={action.success ? 'YOU’RE READY TO RECONNECT' : 'RECONNECT WITH CONFIDENCE'}
          title={action.success ? 'A fresh start, secured.' : 'A fresh start.'}
          description={action.success ? 'Your password has been updated. Sign in with your new password whenever you’re ready.' : 'Choose a new password and get back to\nwhat matters. Make it strong. Make it yours.'} />
      </View>
      {action.success ? (
        <Button style={styles.actions} onPress={() => router.replace('/sign-in')}>Back to sign in</Button>
      ) : (
        <>
          {checking && <ActivityIndicator accessibilityLabel="Checking reset link" color={colors.accent} style={{ marginTop: 24 }} />}
          {!checking && !linkError && (
            <View style={styles.form}>
              <InputField nativeID="reset-password" label="New password" placeholder="Create a new password" password
                value={password} autoComplete="new-password" autoCapitalize="none" editable={!action.loading}
                error={errors.password} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => confirmRef.current?.focus()}
                onChangeText={(value) => { setPassword(value); setErrors({}); action.clear(); }} />
              <InputField ref={confirmRef} nativeID="reset-confirmation" label="Confirm new password" placeholder="Re-enter your new password" password
                value={confirmation} autoComplete="new-password" autoCapitalize="none" editable={!action.loading}
                error={errors.confirmation} returnKeyType="done" onSubmitEditing={submit}
                onChangeText={(value) => { setConfirmation(value); setErrors({}); action.clear(); }} />
            </View>
          )}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Eyebrow>YOUR PASSWORD CHECKLIST</Eyebrow>
            <View>{rules.map((rule) => <Copy key={rule.text} style={{ fontSize: 11, lineHeight: 18, color: rule.met ? colors.accent : colors.muted }}>{`${rule.met ? '✓' : '○'}  ${rule.text}`}</Copy>)}</View>
          </View>
          <Notice message={linkError ?? action.message} />
          {!checking && (linkError ? (
            <Button style={styles.actions} onPress={() => router.replace('/forgot-password')}>Request a new link</Button>
          ) : (
            <Button style={styles.actions} loading={action.loading} onPress={submit}>Reset password</Button>
          ))}
          <TextLink fontSize={13} style={{ marginTop: 8 }} onPress={() => router.replace('/sign-in')}>←  Back to sign in</TextLink>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { marginTop: 58, width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading: { marginTop: 24 },
  form: { marginTop: 24, gap: 18 },
  card: { marginTop: 20, padding: 14, gap: 8, borderWidth: 1, borderRadius: layout.cardRadius },
  actions: { marginTop: 24 },
});
