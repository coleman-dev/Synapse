import assert from 'node:assert/strict';
import test from 'node:test';

import { authError } from '../src/features/auth/errors';
import {
  emailError,
  passwordError,
  validateSignIn,
  validateSignUp,
} from '../src/features/auth/validation';

const validAccount = {
  firstName: 'Toni',
  lastName: 'Coleman',
  email: 'toni@example.com',
  password: 'Recovery2026!go!',
  confirmPassword: 'Recovery2026!go!',
};

test('complete account passes the Figma password requirements', () => {
  assert.deepEqual(validateSignUp(validAccount), {});
});

test('empty names, invalid email, and mismatched passwords are reported together', () => {
  const errors = validateSignUp({
    ...validAccount,
    firstName: ' ',
    lastName: '',
    email: 'bad@',
    confirmPassword: 'different',
  });
  assert.deepEqual(Object.keys(errors), ['firstName', 'lastName', 'email', 'confirmPassword']);
});

test('password boundary is 15 and all character classes are required', () => {
  assert.equal(passwordError('Abcdefghijklm1!'), undefined);
  for (const password of [
    'Abcdefghijkl1!',
    'abcdefghijklm1!',
    'ABCDEFGHIJKLM1!',
    'Abcdefghijklmn!',
    'Abcdefghijklmn1',
    'Abcdefghijklmn ',
  ]) {
    assert.ok(passwordError(password), password);
  }
});

test('email trims outside whitespace and rejects missing domain or embedded spaces', () => {
  assert.equal(emailError(' toni@example.com '), undefined);
  for (const email of ['', 'name', '@example.com', 'user@localhost', 'a b@example.com'])
    assert.ok(emailError(email));
});

test('sign in accepts existing passwords without applying sign up policy', () => {
  assert.deepEqual(validateSignIn({ email: 'toni@example.com', password: 'older-password' }), {});
  assert.deepEqual(Object.keys(validateSignIn({ email: '', password: '' })), ['email', 'password']);
});

test('Firebase sign-in errors avoid revealing whether an account exists', () => {
  assert.equal(
    authError({ code: 'auth/user-not-found' }),
    authError({ code: 'auth/wrong-password' }),
  );
  assert.match(authError({ code: 'auth/network-request-failed' }), /connection/);
  assert.equal(
    authError({ code: 'unknown', message: 'internal payload' }),
    'Something went wrong. Please try again.',
  );
});
