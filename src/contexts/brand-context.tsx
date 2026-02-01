'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Brand } from '@/lib/api-types';
import { getApiClient } from '@/lib/client';
import { unwrap } from '@/lib/api';
import { useAuth } from './auth-context';

type BrandState = {
  brand: Brand | null;
  loading: boolean;
  error: unknown;
};

type BrandContextValue = BrandState & {
  reload: () => Promise<void>;
  updateBrand: (updates: Partial<Pick<Brand, 'name' | 'timezone' | 'phoneNumbers'>>) => Promise<void>;
  updateConfig: (config: Record<string, unknown>) => Promise<void>;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!user?.brandId || !token) {
      setBrand(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = getApiClient();
      const resp = await client.get<{ success: boolean; data?: Brand }>(`/api/v1/brands/${user.brandId}`);
      const data = await unwrap(resp as { success: boolean; data?: Brand });
      setBrand(data);
    } catch (e) {
      setError(e);
      setBrand(null);
    } finally {
      setLoading(false);
    }
  }, [user?.brandId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const updateBrand = useCallback(
    async (updates: Partial<Pick<Brand, 'name' | 'timezone' | 'phoneNumbers'>>) => {
      if (!user?.brandId) return;
      const client = getApiClient();
      await client.put(`/api/v1/brands/${user.brandId}`, updates);
      await load();
    },
    [user?.brandId, load]
  );

  const updateConfig = useCallback(
    async (config: Record<string, unknown>) => {
      if (!user?.brandId) return;
      const client = getApiClient();
      await client.put(`/api/v1/brands/${user.brandId}?replaceFields=config`, { config });
      await load();
    },
    [user?.brandId, load]
  );

  const value = useMemo<BrandContextValue>(
    () => ({
      brand,
      loading,
      error,
      reload: load,
      updateBrand,
      updateConfig,
    }),
    [brand, loading, error, load, updateBrand, updateConfig]
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
