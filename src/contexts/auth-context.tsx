'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '@/lib/client';
import { unwrap } from '@/lib/api';
import {
  clearAuth,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  type StoredUser,
} from '@/lib/storage';

type AuthState = {
  token: string | null;
  user: StoredUser | null;
  loading: boolean;
  checked: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string, apiBaseUrl?: string) => Promise<void>;
  signInWithToken: (apiBaseUrl: string | undefined, token: string, brandId: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);

  const persistAndSet = useCallback((newToken: string, newUser: StoredUser) => {
    setStoredToken(newToken);
    setStoredUser(newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (!t || !u?.brandId) return;
    try {
      const client = getApiClient();
      const resp = await client.get<{ success: boolean; data?: { brandId: string; name: string; email: string } }>(
        `/api/v1/brands/${u.brandId}`
      );
      if (resp.success && (resp as { data?: { name: string } }).data) {
        setUser((prev) => (prev ? { ...prev } : prev));
      }
    } catch {
      // ignore
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string, apiBaseUrl?: string) => {
      const { getApiBaseUrl } = await import('@/lib/client');
      const baseUrl = apiBaseUrl?.trim() || getApiBaseUrl() || (typeof window !== 'undefined' ? window.location.origin : '');
      const { setStoredApiBaseUrl } = await import('@/lib/storage');
      setStoredApiBaseUrl(baseUrl);
      const client = new (await import('@/lib/api')).ApiClient({
        apiBaseUrl: baseUrl,
        token: '',
      });
      const resp = await client.post<{ success: boolean; data?: { token: string; expiresIn: string; user: StoredUser } }>(
        '/api/v1/auth/login',
        { email, password }
      );
      const data = await unwrap(resp as { success: boolean; data?: unknown });
      const d = data as { token: string; expiresIn: string; user: StoredUser };
      if (!d.token || !d.user?.brandId) {
        throw new Error('Invalid login response');
      }
      persistAndSet(d.token, d.user);
    },
    [persistAndSet]
  );

  const signInWithToken = useCallback(
    async (apiBaseUrl: string | undefined, token: string, brandId: string) => {
      if (apiBaseUrl) {
        const { setStoredApiBaseUrl } = await import('@/lib/storage');
        setStoredApiBaseUrl(apiBaseUrl);
      }
      const baseUrl = apiBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
      const client = new (await import('@/lib/api')).ApiClient({ apiBaseUrl: baseUrl, token });
      const resp = await client.verifyToken();
      const data = await unwrap(resp as { success: boolean; data?: unknown });
      const payload = (data as { payload?: { sub?: string } })?.payload;
      if (!payload?.sub) {
        throw new Error('Invalid token');
      }
      const devUser: StoredUser = {
        id: payload.sub,
        email: 'dev@bypass',
        brandId: brandId.trim(),
      };
      persistAndSet(token, devUser);
    },
    [persistAndSet]
  );

  useEffect(() => {
    const t = getStoredToken();
    const u = getStoredUser();
    if (!t || !u?.brandId) {
      setToken(null);
      setUser(null);
      setChecked(true);
      setLoading(false);
      return;
    }
    setToken(t);
    setUser(u);
    const client = getApiClient();
    client
      .verifyToken()
      .then(() => {
        setChecked(true);
      })
      .catch(() => {
        clearAuth();
        setToken(null);
        setUser(null);
        setChecked(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      checked,
      signIn,
      signInWithToken,
      signOut,
      refreshUser,
    }),
    [token, user, loading, checked, signIn, signInWithToken, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
