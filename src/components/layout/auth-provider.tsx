'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type PocketBase from 'pocketbase';
import { getPocketBaseClient, type UserRecord } from '@/lib/pb';

interface AuthContextValue {
  user: UserRecord | null;
  loading: boolean;
  pb: PocketBase;
  signOut: () => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pb] = useState(() => getPocketBaseClient());
  const [user, setUser] = useState<UserRecord | null>(() => (pb.authStore.model as UserRecord) ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return pb.authStore.onChange((token) => {
      setUser((pb.authStore.model as UserRecord) ?? null);
      if (typeof window !== 'undefined') {
        if (token) {
          document.cookie = pb.authStore.exportToCookie({ sameSite: 'lax' });
        } else {
          document.cookie = 'pb_auth=; Max-Age=0; path=/';
        }
      }
    });
  }, [pb]);

  const value = useMemo<AuthContextValue>(
    () => ({
      pb,
      user,
      loading,
      signOut: async () => {
        setLoading(true);
        try {
          pb.authStore.clear();
        } finally {
          setLoading(false);
        }
      },
      requestMagicLink: async (email: string) => {
        setLoading(true);
        try {
          await pb.collection('users').requestEmailAuth(email);
        } finally {
          setLoading(false);
        }
      },
    }),
    [pb, user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
