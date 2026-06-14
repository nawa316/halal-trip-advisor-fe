import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'Halaloka',
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    localePrefix: 'never',
  },
};
