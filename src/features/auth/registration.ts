import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore';

import { validateSignUp, type SignUpValues } from './validation';

export async function registerAccount(auth: Auth, db: Firestore, values: SignUpValues) {
  const errors = validateSignUp(values);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);

  const { user } = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password);
  try {
    await updateProfile(user, {
      displayName: `${values.firstName.trim()} ${values.lastName.trim()}`,
    });
    await setDoc(doc(db, 'users', user.uid), {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Auth and Firestore cannot share a transaction. Compensate only for the
    // account just created, so a rejected profile write can be safely retried.
    try {
      await deleteUser(user);
    } catch {
      throw new Error(
        'Your account was created, but your profile could not be saved. Please contact support before trying again.',
      );
    }
    throw new Error('Your profile could not be saved. Please check your connection and try again.');
  }
  return user;
}
