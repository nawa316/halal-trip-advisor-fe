'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Link, usePathname } from '@/libs/I18nNavigation';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Ringkasan', href: '/dashboard', icon: '📊' },
    { name: 'Rencanakan Trip', href: '/dashboard/planner', icon: '🗺️' },
    { name: 'Trip Saya', href: '/dashboard/trips', icon: '✈️' },
    { name: 'Favorit', href: '/dashboard/favorites', icon: '❤️' },
    { name: 'Profil', href: '/dashboard/profile', icon: '👤' },
  ];

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-gray-200 bg-white md:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-gray-100 p-6">
              <Link
                href="/"
                className="flex items-center text-xl font-black tracking-tighter text-emerald-700"
              >
                HALAL<span className="text-gray-900">OKA</span>
              </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gray-100 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition-all hover:bg-red-50 hover:text-red-600"
              >
                <span>🚪</span>
                Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Topbar Mobile */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 md:hidden">
            <Link
              href="/"
              className="flex items-center text-xl font-black tracking-tighter text-emerald-700"
            >
              HALAL<span className="text-gray-900">OKA</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </header>

          <main className="p-6 md:p-10">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
