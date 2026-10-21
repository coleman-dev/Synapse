import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Copy, Heading, InputField, Notice, TextLink } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { createAccount } from '@/features/auth/service';
import { useAuthAction } from '@/features/auth/useAuthAction';
import {
  PASSWORD_REQUIREMENTS,
  validateSignUp,
  type FieldErrors,
  type SignUpValues,
} from '@/features/auth/validation';
import { useTheme } from '@/theme/ThemeProvider';

const fields = [
  {
    name: 'firstName',
    label: 'First name',
    placeholder: 'Enter first name',
    autoComplete: 'given-name',
  },
  {
    name: 'lastName',
    label: 'Last name',
    placeholder: 'Enter last name',
    autoComplete: 'family-name',
  },
  { name: 'email', label: 'Email address', placeholder: 'you@example.com', autoComplete: 'email' },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Create a password',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    placeholder: 'Re-enter your password',
    autoComplete: 'new-password',
  },
] as const;

export default function SignUpScreen() {
  const { colors } = useTheme();
  const action = useAuthAction();
  const refs = useRef<Partial<Record<keyof SignUpValues, TextInput | null>>>({});
  const [values, setValues] = useState<SignUpValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors<SignUpValues>>({});
  function submit() {
    const next = validateSignUp(values);
    setErrors(next);
    const first = fields.find((field) => next[field.name]);
    if (first) {
      refs.current[first.name]?.focus();
      return;
    }
    void action.run(async () => {
      await createAccount(values);
      setValues({ ...values, password: '', confirmPassword: '' });
      router.replace('/sign-in');
    });
  }
  return (
    <Screen title="Create account">
      <View style={styles.heading}>
        <Heading
          eyebrow="YOUR FIRST CONNECTION"
          title="Create account"
          description="A little about you. A world of possibility."
        />
      </View>
      <View style={styles.form}>
        {fields.map((field, index) => (
          <InputField
            key={field.name}
            {...field}
            nativeID={`signup-${field.name}`}
            ref={(input) => {
              refs.current[field.name] = input;
            }}
            value={values[field.name]}
            error={errors[field.name]}
            password={field.name === 'password' || field.name === 'confirmPassword'}
            autoCapitalize={
              field.name === 'firstName' || field.name === 'lastName' ? 'words' : 'none'
            }
            keyboardType={field.name === 'email' ? 'email-address' : 'default'}
            autoCorrect={false}
            editable={!action.loading}
            returnKeyType={index === 4 ? 'done' : 'next'}
            submitBehavior={index === 4 ? 'blurAndSubmit' : 'submit'}
            onSubmitEditing={() =>
              index === 4 ? submit() : refs.current[fields[index + 1].name]?.focus()
            }
            onChangeText={(text) => {
              setValues({ ...values, [field.name]: text });
              setErrors({ ...errors, [field.name]: undefined });
              action.clear();
            }}
          />
        ))}
        <Copy style={[styles.requirements, { color: colors.muted }]}>{PASSWORD_REQUIREMENTS}</Copy>
      </View>
      <View style={styles.actions}>
        <Button loading={action.loading} onPress={submit}>
          Create account
        </Button>
        <Notice message={action.message} />
        <Copy style={[styles.terms, { color: colors.muted }]}>
          By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy.
        </Copy>
        <TextLink style={styles.accountLink} onPress={() => router.replace('/sign-in')}>
          Already have an account? Sign in
        </TextLink>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: 24 },
  form: { marginTop: 26, gap: 9 },
  requirements: { fontSize: 11, lineHeight: 15.95 },
  actions: { marginTop: 21 },
  terms: { marginTop: 12, fontSize: 10, lineHeight: 14.5, textAlign: 'center' },
  accountLink: { marginTop: -1.5 },
});
