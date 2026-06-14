'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, use } from 'react';
import TripService, { TripDetail } from '@/libs/TripService';

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

const TripDetailPage = ({ params }: TripDetailPageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTripDetail = async () => {
      try {
        const data = await TripService.getTripDetail(id);
        setTrip(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [id]);

  const handleDelete = async () => {
    if (
      !trip ||
      !window.confirm(`Apakah Anda yakin ingin menghapus trip "${trip.name}"?`)
    ) {
      return;
    }

    setDeleting(true);
    try {
      await TripService.deleteTrip(trip.id);
      router.push('/dashboard/trips');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/trips"
          className="text-sm font-bold text-emerald-700 hover:underline"
        >
          ← Kembali ke Daftar Trip
        </Link>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="font-bold text-red-700">
            {error || 'Trip tidak ditemukan'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/dashboard/trips"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            ← Kembali ke Daftar Trip
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{trip.name} 🏝️</h1>
          <p className="text-sm text-gray-500">
            Dibuat pada {new Date(trip.start_time * 1000).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-xl border border-red-200 bg-red-50 px-6 py-2.5 text-sm font-bold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
        >
          {deleting ? 'Menghapus...' : '🗑️ Hapus Trip'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Total Jarak
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {trip.total_distance.toFixed(2)} km
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Waktu Mulai
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {new Date(trip.start_time * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Waktu Selesai
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {new Date(trip.end_time * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Rute Perjalanan 📍</h2>
        <div className="relative space-y-4">
          <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-gray-200" />
          {trip.itinerary && trip.itinerary.length > 0 ? (
            trip.itinerary.map((item, index) => (
              <div key={item.place.id} className="relative pl-10">
                <div className="absolute top-2 left-2.5 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                          {item.place.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {index === 0
                            ? 'Titik Pertama'
                            : `Pemberhentian ke-${index + 1}`}
                        </span>
                      </div>
                      <h4 className="mt-1 text-lg font-bold text-gray-900">
                        {item.place.name}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                          <span>🏷️</span> {item.place.category}
                        </p>
                        <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <span>⭐</span> {item.place.rating}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-400">
                          <span>📍</span> {item.place.latitude.toFixed(4)},{' '}
                          {item.place.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ml-10 flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 py-10 text-center">
              <p className="text-gray-500 italic">
                Tidak ada item rute untuk trip ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailPage;
