import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, test } from 'node:test';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  connectFirestoreEmulator, getFirestore, doc, setDoc, getDoc, updateDoc,
  deleteDoc, getDocs, collection, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { registerAccount } from '../src/features/auth/registration';
import { resetPassword } from '../src/features/auth/password-reset';

const projectId = 'demo-synapse';
let env: RulesTestEnvironment;
before(async () => {
  env = await initializeTestEnvironment({
    projectId,
    firestore: { host: '127.0.0.1', port: 8080, rules: readFileSync('firestore.rules', 'utf8') },
  });
});
beforeEach(async () => { await env.clearFirestore(); });
after(async () => { await env?.cleanup(); });
const profile = () => ({
  firstName: 'Toni', lastName: 'Coleman', email: 'owner@example.com',
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
});
const ownerDb = () => env.authenticatedContext('owner', { email: 'owner@example.com' }).firestore();

test('owner can create, get, and update their profile without changing createdAt', async () => {
  const ref = doc(ownerDb(), 'users/owner');
  await assertSucceeds(setDoc(ref, profile()));
  const original = (await assertSucceeds(getDoc(ref))).data()!;
  await assertSucceeds(updateDoc(ref, { firstName: 'Tonia', updatedAt: serverTimestamp() }));
  const updated = (await getDoc(ref)).data()!;
  assert.equal(updated.firstName, 'Tonia');
  assert.ok(updated.createdAt.isEqual(original.createdAt));
});

test('anonymous and other users cannot read, create, update, delete, or list profiles', async () => {
  await setDoc(doc(ownerDb(), 'users/owner'), profile());
  for (const db of [env.unauthenticatedContext().firestore(), env.authenticatedContext('other', { email: 'other@example.com' }).firestore()]) {
    const ref = doc(db, 'users/owner');
    await assertFails(getDoc(ref));
    await assertFails(setDoc(ref, profile()));
    await assertFails(updateDoc(ref, { firstName: 'Intruder', updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(ref));
    await assertFails(getDocs(collection(db, 'users')));
  }
});

test('owner cannot spoof identity, timestamps, schema, roles, or access unrelated paths', async () => {
  const db = ownerDb();
  const ref = doc(db, 'users/owner');
  for (const data of [
    { ...profile(), email: 'other@example.com' },
    { ...profile(), firstName: '' },
    { ...profile(), lastName: 42 },
    { ...profile(), firstName: 'a'.repeat(101) },
    { ...profile(), role: 'admin' },
    { ...profile(), createdAt: Timestamp.fromMillis(0) },
    { ...profile(), updatedAt: Timestamp.fromMillis(0) },
    { firstName: 'Missing fields' },
  ]) await assertFails(setDoc(ref, data));
  await setDoc(ref, profile());
  await assertFails(updateDoc(ref, { createdAt: Timestamp.fromMillis(0), updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(ref));
  await assertFails(getDocs(collection(db, 'users')));
  await assertFails(setDoc(doc(db, 'users/owner/private/secret'), { value: true }));
  await assertFails(setDoc(doc(db, 'unrelated/example'), { value: true }));
});

test('registration creates Auth and Firestore records; login, logout, recovery work', async () => {
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, 'registration-test');
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const email = `registration-${Date.now()}@example.com`;
  const password = 'SynapseTesting2026!';
  try {
    const user = await registerAccount(auth, db, {
      firstName: ' Toni ', lastName: ' Coleman ', email, password, confirmPassword: password,
    });
    assert.equal(getAuth(app).currentUser?.uid, user.uid);
    assert.equal(user.displayName, 'Toni Coleman');
    const data = (await getDoc(doc(db, 'users', user.uid))).data()!;
    assert.equal(data.firstName, 'Toni');
    assert.equal(data.lastName, 'Coleman');
    assert.equal(data.email, email);
    assert.ok(data.createdAt instanceof Timestamp);
    assert.ok(data.updatedAt instanceof Timestamp);
    await signOut(auth);
    assert.equal(auth.currentUser, null);
    const signedIn = await signInWithEmailAndPassword(auth, email, password);
    assert.equal(signedIn.user.uid, user.uid);
    await sendPasswordResetEmail(auth, email);
    const response = await fetch(`http://127.0.0.1:9099/emulator/v1/projects/${projectId}/oobCodes`);
    const codes = await response.json() as { oobCodes: { email: string; oobCode: string }[] };
    const code = codes.oobCodes.find((item) => item.email === email)!;
    assert.ok(code);
    await assert.rejects(resetPassword(auth, code.oobCode, password), { code: 'auth/password-reused' });
    assert.equal(getAuth(app).currentUser?.uid, user.uid);
    await resetPassword(auth, code.oobCode, 'UpdatedSynapse2026!');
    assert.equal(auth.currentUser, null);
    await signOut(auth);
    await assert.rejects(signInWithEmailAndPassword(auth, email, password));
    await signInWithEmailAndPassword(auth, email, 'UpdatedSynapse2026!');
  } finally { await deleteApp(app); }
});

test('failed profile write rolls back the newly created Auth account', async () => {
  const app = initializeApp({ projectId, apiKey: 'demo-key' }, 'rollback-test');
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  const email = `rollback-${Date.now()}@example.com`;
  try {
    await assert.rejects(registerAccount(auth, db, {
      firstName: 'x'.repeat(101), lastName: 'Coleman', email,
      password: 'SynapseTesting2026!', confirmPassword: 'SynapseTesting2026!',
    }), /profile could not be saved/);
    assert.equal(auth.currentUser, null);
    await assert.rejects(signInWithEmailAndPassword(auth, email, 'SynapseTesting2026!'));
  } finally { await deleteApp(app); }
});
