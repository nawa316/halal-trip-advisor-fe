'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering auth-dependent part until mounted
  const renderAuthSection = () => {
    if (!mounted || loading) {
      return (
        <div className="h-10 w-24 animate-pulse rounded-full bg-gray-100"></div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            Halo, <span className="font-bold text-gray-900">{user?.name}</span>
          </span>
          <button
            onClick={logout}
            className="text-sm font-bold text-gray-600 transition hover:text-red-600"
          >
            Keluar
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <Link
          href="/auth/login"
          className="text-sm font-bold text-gray-600 transition hover:text-gray-900"
        >
          Masuk
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Daftar
        </Link>
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between py-8">
      <div>
        <Link
          href="/"
          className="group flex items-center gap-2 text-2xl font-black tracking-tighter text-emerald-800"
        >
          HALALOKA
        </Link>
      </div>

      <nav aria-label="Main navigation" className="hidden md:block">
        <ul className="flex items-center gap-x-8 text-sm font-bold uppercase tracking-widest text-gray-600">
          <li>
            <Link className="transition hover:text-emerald-700" href="/#fitur">
              Fitur
            </Link>
          </li>
          <li>
            <Link
              className="transition hover:text-emerald-700"
              href="/#persona"
            >
              Persona
            </Link>
          </li>
          <li>
            <Link
              className="transition hover:text-emerald-700"
              href="/#roadmap"
            >
              Roadmap
            </Link>
          </li>
        </ul>
      </nav>

      {renderAuthSection()}
    </header>
  );
};

export default Navbar;
