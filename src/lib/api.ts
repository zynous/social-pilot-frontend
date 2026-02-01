import type { ApiResponse, PaginatedApiResponse } from './api-types';

export class ApiError extends Error {
  status: number;
  bodyText?: string;

  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.status = status;
    this.bodyText = bodyText;
  }
}

function joinUrl(base: string, path: string): string {
  const cleanBase = (base || '').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

export type ApiClientOptions = {
  apiBaseUrl: string;
  token: string;
};

export class ApiClient {
  private apiBaseUrl: string;
  private token: string;

  constructor(opts: ApiClientOptions) {
    this.apiBaseUrl = opts.apiBaseUrl || '';
    this.token = opts.token;
  }

  async verifyToken(): Promise<ApiResponse<{ valid: boolean; payload: unknown }>> {
    return this.get<ApiResponse<{ valid: boolean; payload: unknown }>>('/api/v1/auth/verify');
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'POST', body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body });
  }

  async request<T>(
    path: string,
    init: { method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; headers?: Record<string, string> }
  ): Promise<T> {
    const url = joinUrl(this.apiBaseUrl, path);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };

    const res = await fetch(url, {
      method: init.method,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiError(`Request failed (${res.status})`, res.status, text);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new ApiError('Expected JSON response', res.status, text);
    }

    return (await res.json()) as T;
  }
}

export async function unwrap<T>(resp: ApiResponse<T>): Promise<T> {
  if (!resp.success) {
    throw new Error(resp.error || resp.message || 'Request failed');
  }
  return resp.data as T;
}

export async function unwrapPaginated<T>(resp: PaginatedApiResponse<T>): Promise<{ items: T[]; pagination: unknown }> {
  if (!resp.success) {
    throw new Error(resp.error || resp.message || 'Request failed');
  }
  return { items: (resp.data || []) as T[], pagination: resp.pagination };
}
