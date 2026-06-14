import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import AppLayout from '@/components/AppLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/global.css';

export const metadata: Metadata = {
  title: 'Halaloka',
  description: 'Plan your halal food trips',
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  setRequestLocale('en');
  const messages = await getMessages();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white">
        <NextIntlClientProvider messages={messages} locale="en">
          <AuthProvider>
            <AppLayout>{props.children}</AppLayout>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
