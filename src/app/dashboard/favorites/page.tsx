'use client';

import React, { useEffect, useState } from 'react';
import TripService, { Favorite } from '@/libs/TripService';

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const data = await TripService.getFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (placeId: string) => {
    try {
      await TripService.removeFromFavorites(placeId);
      setFavorites(favorites.filter((f) => f.place_id !== placeId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Tempat Favorit ❤️</h1>
        <p className="text-gray-500">
          Daftar tempat yang telah Anda simpan untuk dikunjungi nanti.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="mb-4 text-5xl">❤️</div>
          <h3 className="text-lg font-bold text-gray-900">Belum Ada Favorit</h3>
          <p className="mx-auto max-w-xs text-sm text-gray-500">
            Anda belum menyimpan tempat apapun ke favorit. Telusuri tempat
            menarik dan klik ikon hati untuk menyimpannya.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                  {fav.place.type === 'Restaurants' ? '🍽️' : '🎡'}
                </div>
                <button
                  onClick={() => handleRemoveFavorite(fav.place_id)}
                  className="rounded-full bg-rose-50 p-2 text-rose-600 transition-all hover:bg-rose-100 active:scale-90"
                  title="Hapus dari favorit"
                >
                  ❤️
                </button>
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                {fav.place.name}
              </h3>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                    {fav.place.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {fav.place.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <span>⭐</span>
                  <span>{fav.place.rating}</span>
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full rounded-lg border border-gray-200 py-2 text-xs font-bold text-gray-600 transition-all hover:bg-gray-50">
                  Lihat Detail Tempat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
