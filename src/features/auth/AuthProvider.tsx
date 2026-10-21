import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { configuredAuth } from './firebase';
import { firebaseConfigured } from './firebase-config';

const AuthContext = createContext<{ user: User | null; ready: boolean }>({
  user: null,
  ready: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!firebaseConfigured);
  useEffect(() => {
    if (!firebaseConfigured) return;
    try {
      return onAuthStateChanged(
        configuredAuth(),
        (nextUser) => {
          setUser(nextUser);
          setReady(true);
        },
        () => setReady(true),
      );
    } catch {
      void Promise.resolve().then(() => setReady(true));
    }
  }, []);
  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
