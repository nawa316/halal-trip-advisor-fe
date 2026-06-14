import { Env } from '@/libs/Env';

/**
 * Resolves the public base URL of the application.
 * @returns The configured public app URL or the local development URL.
 */
export const getBaseUrl = () => {
  if (Env.NEXT_PUBLIC_APP_URL) {
    return Env.NEXT_PUBLIC_APP_URL;
  }

  return 'http://localhost:3000';
};

/**
 * Returns an application-relative path.
 * @param url - The base application-relative path starting with a slash.
 * @returns The normalized path.
 */
export const getI18nPath = (url: string) => {
  return url;
};
