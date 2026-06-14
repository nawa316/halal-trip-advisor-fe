'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import TripService, { Trip } from '@/libs/TripService';

const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await TripService.getTrips();
      setTrips(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus trip "${name}"?`)) {
      return;
    }

    try {
      await TripService.deleteTrip(id);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Trip Saya ✈️</h1>
        <p className="text-gray-500">
          Daftar semua rencana perjalanan yang telah Anda simpan.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="mb-4 text-5xl">🏜️</div>
          <h3 className="text-lg font-bold text-gray-900">Belum Ada Trip</h3>
          <p className="mx-auto max-w-xs text-sm text-gray-500">
            Anda belum menyimpan rencana perjalanan apapun. Mulai buat rencana
            pertama Anda di menu Planner.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                  🏝️
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase">
                  {new Date(trip.start_time * 1000).toLocaleDateString()}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
                {trip.name}
              </h3>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>📍</span>
                  <span>{trip.total_distance.toFixed(2)} km perjalanan</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>⏰</span>
                  <span>
                    {new Date(trip.start_time * 1000).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(trip.end_time * 1000).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Link
                  href={`/dashboard/trips/${trip.id}`}
                  className="flex-1 rounded-lg bg-emerald-700 py-2 text-center text-xs font-bold text-white transition-all hover:bg-emerald-800"
                >
                  Lihat Detail
                </Link>
                <button
                  onClick={() => handleDeleteTrip(trip.id, trip.name)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPage;
