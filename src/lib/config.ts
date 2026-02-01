const getEnv = (key: string): string =>
  typeof process !== 'undefined' && process.env[key] ? (process.env[key] as string).trim() : '';

export const serviceConfig = {
  apiBaseUrl: getEnv('SOCIAL_PILOT_API_BASE_URL'),
} as const;

export type ServiceConfig = typeof serviceConfig;
