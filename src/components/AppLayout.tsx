'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { usePathname } from '@/libs/I18nNavigation';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  // Simplified check for both direct path and localized path
  const isDashboard =
    pathname.startsWith('/dashboard') || pathname.includes('/dashboard');

  if (isDashboard) {
    return (
      <>
        <Toaster
          position="bottom-right"
          toastOptions={{
            success: {
              style: {
                background: '#f0fdf4',
                color: '#14532d',
                border: '1px solid #bbf7d0',
                fontWeight: '600',
                fontSize: '14px',
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#f0fdf4',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#7f1d1d',
                border: '1px solid #fecaca',
                fontWeight: '600',
                fontSize: '14px',
              },
            },
            duration: 3000,
          }}
        />
        {children}
      </>
    );
  }

  return (
    <div className="w-full text-gray-700 antialiased">
      <div className="mx-auto max-w-6xl px-6">
        <Navbar />
        <main>{children}</main>

        <footer className="mt-20 border-t border-gray-100 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-xl font-black tracking-tighter text-emerald-800">
              HALAL<span className="text-gray-900">OKA</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Halaloka. Menjadikan perjalanan Anda
              lebih berkah.
            </div>
            <div className="flex gap-6 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-emerald-700">
                Tentang Kami
              </a>
              <a href="#" className="hover:text-emerald-700">
                Kontak
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
