'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TripService, { Trip, Favorite } from '@/libs/TripService';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tripsData, favoritesData] = await Promise.all([
          TripService.getTrips(),
          TripService.getFavorites(),
        ]);

        // Sort by start_time descending (most recent first)
        const sortedTrips = [...tripsData].sort(
          (a, b) => b.start_time - a.start_time
        );
        setTrips(sortedTrips);
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Trip',
      value: loading ? '...' : trips.length.toString(),
      icon: '✈️',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Tempat Favorit',
      value: loading ? '...' : favorites.length.toString(),
      icon: '❤️',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      label: 'Review',
      value: '0',
      icon: '📝',
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const recentTrips = trips.slice(0, 2);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat datang, {user?.name}! 👋
        </h1>
        <p className="mt-2 text-gray-500">
          Mulai rencanakan perjalanan wisata halal Anda berikutnya.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-2xl`}
            >
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Trip Terakhir</h3>
            {trips.length > 0 && (
              <Link
                href="/dashboard/trips"
                className="text-sm font-bold text-emerald-700 hover:underline"
              >
                Lihat Semua
              </Link>
            )}
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl bg-gray-50"
                  ></div>
                ))}
              </div>
            ) : trips.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 text-4xl">📭</div>
                <p className="text-sm font-medium text-gray-500">
                  Belum ada aktivitas trip terbaru.
                </p>
                <Link
                  href="/dashboard/planner"
                  className="mt-4 rounded-full bg-emerald-700 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-emerald-800 active:scale-95"
                >
                  Buat Rencana Trip
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/dashboard/trips/${trip.id}`}
                    className="group flex items-center gap-4 rounded-xl border border-gray-50 p-4 transition-all hover:border-emerald-100 hover:bg-emerald-50/30"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      🏝️
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate font-bold text-gray-900 group-hover:text-emerald-700">
                        {trip.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(trip.start_time * 1000).toLocaleDateString()}{' '}
                        • {trip.total_distance.toFixed(2)} km
                      </p>
                    </div>
                    <span className="text-gray-400 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                ))}

                {trips.length > 2 && (
                  <p className="mt-4 text-center text-xs text-gray-400">
                    Menampilkan 2 dari {trips.length} trip.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="rounded-2xl bg-emerald-800 p-8 text-white shadow-lg">
          <h3 className="text-xl font-bold">Tips Halaloka 🕌</h3>
          <ul className="mt-6 space-y-4">
            <li className="flex items-start gap-3 text-sm leading-relaxed text-emerald-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold">
                1
              </span>
              Gunakan fitur filter masjid untuk menemukan tempat shalat terdekat
              di rute Anda.
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-emerald-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold">
                2
              </span>
              Cek status sertifikasi halal restoran melalui detail tempat
              sebelum berkunjung.
            </li>
            <li className="flex items-start gap-3 text-sm leading-relaxed text-emerald-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold">
                3
              </span>
              Simpan trip Anda sebagai draft agar bisa diedit kembali nanti.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
