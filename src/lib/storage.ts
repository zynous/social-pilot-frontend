const KEYS = {
  token: 'sp_frontend_token',
  apiBaseUrl: 'sp_frontend_apiBaseUrl',
  user: 'sp_frontend_user',
  onboardingComplete: 'sp_frontend_onboardingComplete',
} as const;

function get(key: string): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
}

function set(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(key);
}

export function getStoredToken(): string {
  return get(KEYS.token);
}

export function setStoredToken(value: string): void {
  set(KEYS.token, value);
}

export function getStoredApiBaseUrl(): string {
  return get(KEYS.apiBaseUrl);
}

export function setStoredApiBaseUrl(value: string): void {
  set(KEYS.apiBaseUrl, value);
}

export type StoredUser = {
  id: string;
  email: string;
  brandId: string;
  role?: string;
};

export function getStoredUser(): StoredUser | null {
  const raw = get(KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  set(KEYS.user, JSON.stringify(user));
}

export function getOnboardingComplete(): boolean {
  return get(KEYS.onboardingComplete) === 'true';
}

export function setOnboardingComplete(value: boolean): void {
  set(KEYS.onboardingComplete, value ? 'true' : 'false');
}

export function clearAuth(): void {
  remove(KEYS.token);
  remove(KEYS.user);
}

export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}
