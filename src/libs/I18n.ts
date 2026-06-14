import { getRequestConfig } from 'next-intl/server';
import { routing } from './I18nRouting';

export default getRequestConfig(async () => {
  return {
    locale: routing.defaultLocale,
    // oxlint-disable-next-line unicorn/no-await-expression-member
    messages: (await import('../locales/en.json')).default,
  };
});
