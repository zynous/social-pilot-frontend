'use client';

import { ApiClient } from './api';
import { serviceConfig } from './config';
import { getStoredApiBaseUrl, getStoredToken } from './storage';

export function getApiClient(): ApiClient {
  return new ApiClient({
    apiBaseUrl: getApiBaseUrl(),
    token: getStoredToken(),
  });
}

export function getApiBaseUrl(): string {
  const stored = getStoredApiBaseUrl();
  if (stored) return stored;
  if (serviceConfig.apiBaseUrl) return serviceConfig.apiBaseUrl;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}
