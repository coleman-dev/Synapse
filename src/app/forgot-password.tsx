import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Copy,
  Eyebrow,
  Heading,
  InputField,
  Notice,
  TextLink,
} from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { recoverPassword } from '@/features/auth/service';
import { useAuthAction } from '@/features/auth/useAuthAction';
import { emailError } from '@/features/auth/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const action = useAuthAction();
  const inputRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  function submit() {
    const next = emailError(email);
    setError(next);
    if (next) {
      inputRef.current?.focus();
      return;
    }
    void action.run(
      () => recoverPassword(email),
      'If an account uses this email, a password reset link will arrive shortly. Check your inbox and spam folder.',
    );
  }
  return (
    <Screen title="Password recovery" fallback="/sign-in">
      <View style={[styles.icon, { backgroundColor: colors.surface }]}>
        <Image
          source={require('../../assets/icons/recovery-lock.svg')}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
          accessibilityElementsHidden
        />
      </View>
      <View style={styles.heading}>
        <Heading
          recovery
          eyebrow="LET’S GET YOU BACK IN"
          title="Forgot password?"
          description={
            'It happens. Enter your email and we’ll send\nyou a link to reset your password.'
          }
        />
      </View>
      <View style={styles.form}>
        <InputField
          ref={inputRef}
          nativeID="recovery-email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="send"
          editable={!action.loading}
          error={error}
          onSubmitEditing={submit}
          onChangeText={(text) => {
            setEmail(text);
            setError(undefined);
            action.clear();
          }}
        />
        <Button loading={action.loading} onPress={submit}>
          Send reset link
        </Button>
        <TextLink fontSize={13} style={styles.backLink} onPress={() => router.replace('/sign-in')}>
          ← Back to sign in
        </TextLink>
      </View>
      <Notice message={action.message} success={action.success} />
      <View style={styles.help}>
        <Eyebrow>CHECK YOUR INBOX</Eyebrow>
        <Copy style={[styles.helpCopy, { color: colors.muted }]}>
          {
            'If you don’t see the email, check your spam\nfolder or try again with the email you signed up with.'
          }
        </Copy>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginTop: 58,
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { marginTop: 24 },
  form: { marginTop: 27, gap: 24 },
  backLink: { marginTop: -12.5 },
  help: { marginTop: 58.5, gap: 8 },
  helpCopy: { fontSize: 12, lineHeight: 17.4 },
});
