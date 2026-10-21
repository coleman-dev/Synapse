import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  Button,
  Copy,
  Divider,
  Heading,
  InputField,
  Notice,
  TextLink,
} from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/features/auth/AuthProvider';
import { endSession, signIn, signInGoogle } from '@/features/auth/service';
import { useAuthAction } from '@/features/auth/useAuthAction';
import { validateSignIn, type FieldErrors, type SignInValues } from '@/features/auth/validation';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignInScreen() {
  const { colors } = useTheme();
  const { user, ready } = useAuth();
  const action = useAuthAction();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [values, setValues] = useState<SignInValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<SignInValues>>({});
  const [remember, setRemember] = useState(false);
  function submit() {
    const next = validateSignIn(values);
    setErrors(next);
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.password) {
      passwordRef.current?.focus();
      return;
    }
    void action.run(async () => {
      await signIn(values.email, values.password, remember);
      setValues({ ...values, password: '' });
    });
  }
  if (!ready) return <Screen title="Sign in" />;
  if (user)
    return (
      <Screen title="Signed in">
        <View style={styles.heading}>
          <Heading
            eyebrow="YOU’RE CONNECTED"
            title="You’re signed in"
            description={`Welcome${user.displayName ? `, ${user.displayName}` : ''}. Your Synapse account is ready.`}
          />
        </View>
        <View style={styles.form}>
          <Copy style={{ color: colors.muted }}>
            Recovery features are coming in a future sprint.
          </Copy>
          <Button loading={action.loading} onPress={() => void action.run(endSession)}>
            Sign out
          </Button>
          <Notice message={action.message} />
        </View>
      </Screen>
    );
  return (
    <Screen title="Sign in">
      <View style={styles.heading}>
        <Heading
          eyebrow="GOOD TO SEE YOU AGAIN"
          title="Welcome back"
          description="Sign in and pick up where you left off."
        />
      </View>
      <View style={styles.form}>
        <InputField
          ref={emailRef}
          nativeID="signin-email"
          label="Email address"
          placeholder="you@example.com"
          value={values.email}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          returnKeyType="next"
          submitBehavior="submit"
          editable={!action.loading}
          error={errors.email}
          onSubmitEditing={() => passwordRef.current?.focus()}
          onChangeText={(email) => {
            setValues({ ...values, email });
            setErrors({ ...errors, email: undefined });
            action.clear();
          }}
        />
        <InputField
          ref={passwordRef}
          nativeID="signin-password"
          label="Password"
          placeholder="Enter your password"
          password
          value={values.password}
          autoCapitalize="none"
          autoComplete="current-password"
          returnKeyType="done"
          editable={!action.loading}
          error={errors.password}
          onSubmitEditing={submit}
          onChangeText={(password) => {
            setValues({ ...values, password });
            setErrors({ ...errors, password: undefined });
            action.clear();
          }}
        />
      </View>
      <View style={styles.options}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Remember me"
          accessibilityState={{ checked: remember }}
          aria-checked={remember}
          onPress={() => setRemember(!remember)}
          style={styles.remember}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: colors.muted,
                backgroundColor: remember ? colors.primary : 'transparent',
              },
            ]}
          >
            {remember && (
              <Copy style={{ color: colors.onPrimary, fontSize: 9, lineHeight: 10 }}>✓</Copy>
            )}
          </View>
          <Copy style={{ color: colors.muted, fontSize: 12 }}>Remember me</Copy>
        </Pressable>
        <TextLink align="right" onPress={() => router.push('/forgot-password')}>
          Forgot password?
        </TextLink>
      </View>
      <View style={styles.actions}>
        <Button loading={action.loading} onPress={submit}>
          Sign in
        </Button>
        <Divider />
        <Button
          variant="google"
          disabled={action.loading}
          onPress={() => void action.run(() => signInGoogle(remember))}
        >
          Sign in with Google
        </Button>
        <TextLink style={styles.accountLink} onPress={() => router.replace('/sign-up')}>
          New to Synapse? Create account
        </TextLink>
      </View>
      <Notice message={action.message} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: 52 },
  form: { marginTop: 46, gap: 22 },
  options: {
    marginTop: 29,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  remember: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { marginTop: 19, gap: 16 },
  accountLink: { marginTop: -13.5 },
});
