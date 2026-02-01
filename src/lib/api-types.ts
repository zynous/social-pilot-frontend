export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
};

export type PaginatedApiResponse<T> = ApiResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type Brand = {
  brandId: string;
  brandType: 'external' | 'internal' | 'system';
  templateId?: string | null;
  name: string;
  slug: string;
  email: string;
  phoneNumbers: string[];
  status: 'active' | 'inactive';
  timezone: string;
  config?: Record<string, unknown>;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  token: string;
  expiresIn: string;
  user: {
    id: string;
    email: string;
    brandId: string;
    role?: string;
  };
};
