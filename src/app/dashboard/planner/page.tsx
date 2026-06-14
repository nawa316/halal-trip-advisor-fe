'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';
import LocationPicker from '@/components/LocationPicker';
import TripMap from '@/components/TripMap';
import TripService, { PlanningResponse, Place } from '@/libs/TripService';
import { haversine } from '@/utils/GeoUtils';

const plannerSchema = z.object({
  start_lat: z.number({ message: 'Latitude harus berupa angka' }),
  start_long: z.number({ message: 'Longitude harus berupa angka' }),
  start_location_name: z.string().optional(),
  start_time: z.string().min(1, 'Waktu mulai harus diisi'),
  end_time: z.string().min(1, 'Waktu berakhir harus diisi'),
  preferences: z.array(z.string()).min(1, 'Pilih minimal satu preferensi'),
  max_places: z.number().min(1).max(15),
  return_to_start: z.boolean(),
});

type PlannerFormValues = z.infer<typeof plannerSchema>;

const PlannerPage: React.FC = () => {
  const [result, setResult] = useState<PlanningResponse | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Regenerate State
  const [currentSeed, setCurrentSeed] = useState(0);
  const [lastFormData, setLastFormData] = useState<PlannerFormValues | null>(
    null
  );

  // Replacement State
  interface PlaceWithDistance extends Place {
    distance?: number;
  }
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<PlaceWithDistance[]>([]);
  const [alternativesLoading, setAlternativesLoading] = useState(false);
  const [altTypeFilter, setAltTypeFilter] = useState<string>('');
  const [altCategoryFilter, setAltCategoryFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlternatives = alternatives.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favs = await TripService.getFavorites();
        setFavorites(favs.map((f) => f.place_id));
      } catch (e) {
        console.error('Failed to fetch favorites');
      }
    };
    fetchFavorites();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlannerFormValues>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      start_lat: -8.74685184916022, // Default Bandara Ngurah Rai Bali
      start_long: 115.16818981622217,
      start_location_name: 'Bandara Internasional I Gusti Ngurah Rai Bali',
      max_places: 8,
      preferences: ['Tourist Attractions', 'Restaurants'],
      return_to_start: true,
    },
  });

  const selectedPrefs = watch('preferences') || [];

  const handleGetCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('start_lat', position.coords.latitude, { shouldValidate: true });
        setValue('start_long', position.coords.longitude, { shouldValidate: true });
        setValue('start_location_name', 'Lokasi Saat Ini', { shouldValidate: true });
        setLocating(false);
      },
      () => {
        setError('Gagal mendapatkan lokasi. Pastikan izin lokasi aktif.');
        setLocating(false);
      }
    );
  };

  const onSubmit = async (data: PlannerFormValues) => {
    setLoading(true);
    setError(null);
    setCurrentSeed(0);
    setLastFormData(data);
    try {
      const startUnix = new Date(data.start_time).getTime() / 1000;
      const endUnix = new Date(data.end_time).getTime() / 1000;

      if (endUnix <= startUnix) {
        throw new Error('Waktu berakhir harus setelah waktu mulai');
      }

      const response = await TripService.generateTrip({
        ...data,
        start_time: startUnix,
        end_time: endUnix,
        seed: 0,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!lastFormData) return;
    const newSeed = currentSeed + 1;
    setCurrentSeed(newSeed);
    setLoading(true);
    setError(null);
    try {
      const startUnix = new Date(lastFormData.start_time).getTime() / 1000;
      const endUnix = new Date(lastFormData.end_time).getTime() / 1000;

      const response = await TripService.generateTrip({
        ...lastFormData,
        start_time: startUnix,
        end_time: endUnix,
        seed: newSeed,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReplaceModal = async (index: number, place: Place) => {
    setReplacingIndex(index);
    setAltTypeFilter(place.type);
    setAltCategoryFilter(place.category);
    setSearchTerm('');
    setReplaceModalOpen(true);

    let prevLat = watch('start_lat');
    let prevLong = watch('start_long');
    if (index > 0 && result) {
      prevLat = result.itinerary[index - 1]?.place.latitude || prevLat;
      prevLong = result.itinerary[index - 1]?.place.longitude || prevLong;
    }
    fetchAlternatives(place.type, place.category, place.id, prevLat, prevLong);
  };

  const fetchAlternatives = async (
    type: string,
    category: string,
    excludeId?: string,
    prevLat?: number,
    prevLong?: number
  ) => {
    setAlternativesLoading(true);
    try {
      const alt = await TripService.getAlternatives(type, category);
      let filtered: PlaceWithDistance[] = excludeId
        ? alt.filter((p) => p.id !== excludeId)
        : alt;

      if (prevLat !== undefined && prevLong !== undefined) {
        filtered = filtered
          .map((p) => ({
            ...p,
            distance: haversine(prevLat, prevLong, p.latitude, p.longitude),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setAlternatives(filtered);
    } catch (e) {
      console.error('Failed to fetch alternatives');
    } finally {
      setAlternativesLoading(false);
    }
  };

  const handleReplacePlace = (newPlace: Place) => {
    if (replacingIndex === null || !result) return;

    const newItineraryItems = [...result.itinerary];
    const currentItem = newItineraryItems[replacingIndex];
    if (!currentItem) return;

    // Replace the place in the array
    newItineraryItems[replacingIndex] = {
      ...currentItem,
      place: newPlace,
    };

    // Recalculate everything from the start to ensure consistency
    const formValues = watch();
    const startUnix = new Date(formValues.start_time).getTime() / 1000;
    let currentLat = formValues.start_lat;
    let currentLong = formValues.start_long;
    let runningTime = startUnix;
    let totalDistance = 0;

    const updatedItinerary = newItineraryItems.map((item, i) => {
      if (i === 0 && item.place.type === 'Starting Point') {
        currentLat = item.place.latitude;
        currentLong = item.place.longitude;
        runningTime = item.departure_time;
        return item;
      }

      const dist = haversine(
        currentLat,
        currentLong,
        item.place.latitude,
        item.place.longitude
      );

      const travelTimeSeconds = Math.floor((dist / 30.0) * 3600);
      const arrivalTime = runningTime + travelTimeSeconds;

      const spendTime = item.place.type === 'End Point' ? 0 : 3600;
      const departureTime = arrivalTime + spendTime;

      currentLat = item.place.latitude;
      currentLong = item.place.longitude;
      runningTime = departureTime;
      totalDistance += dist;

      return {
        ...item,
        distance_from_previous: dist,
        arrival_time: arrivalTime,
        departure_time: departureTime,
      };
    });

    setResult({
      ...result,
      itinerary: updatedItinerary,
      total_distance: totalDistance,
      total_duration: runningTime - startUnix,
    });
    setReplaceModalOpen(false);
  };

  const handleSaveTrip = async () => {
    if (!result) return;

    const tripName = window.prompt(
      'Masukkan nama untuk rencana perjalanan ini:',
      'Trip Saya'
    );
    if (!tripName) return;

    setSaving(true);
    setError(null);
    try {
      await TripService.saveTrip({
        name: tripName,
        start_time: result.itinerary[0]?.arrival_time || 0,
        end_time:
          result.itinerary[result.itinerary.length - 1]?.departure_time || 0,
        total_distance: result.total_distance,
        place_ids: result.itinerary.map((item) => item.place.id),
      });
      toast.success('Rencana perjalanan berhasil disimpan! 🗺️');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan rencana perjalanan.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFavorite = async (placeId: string, placeName: string) => {
    try {
      if (favorites.includes(placeId)) {
        await TripService.removeFromFavorites(placeId);
        setFavorites(favorites.filter((id) => id !== placeId));
        toast(`${placeName} dihapus dari favorit`, {
          icon: '💔',
          style: {
            background: '#fff7ed',
            color: '#9a3412',
            border: '1px solid #fed7aa',
            fontWeight: '600',
            fontSize: '14px',
          },
        });
      } else {
        await TripService.addToFavorites(placeId);
        setFavorites([...favorites, placeId]);
        toast.success(`${placeName} ditambahkan ke favorit! ❤️`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Gagal mengubah favorit.');
    }
  };

  const handlePrefChange = (pref: string) => {
    const current = selectedPrefs || [];
    if (current.includes(pref)) {
      setValue(
        'preferences',
        current.filter((p) => p !== pref)
      );
    } else {
      setValue('preferences', [...current, pref]);
    }
  };

  const prefGroups = [
    {
      category: 'Tourist Attractions',
      label: '🎡 Tempat Wisata',
      types: [
        { id: 'Alam', label: 'Alam 🌿' },
        { id: 'Budaya', label: 'Budaya 🏯' },
        { id: 'Buatan', label: 'Buatan 🏗️' },
      ],
    },
    {
      category: 'Restaurants',
      label: '🍽️ Restoran & Kuliner',
      types: [
        { id: 'Halal (Tersertifikasi)', label: 'Halal (Cert) ✅' },
        { id: 'Halal (Belum Tersertifikasi)', label: 'Halal (Uncert) 🟡' },
        { id: 'Vegetarian', label: 'Vegetarian 🥗' },
        { id: 'Non-Halal', label: 'Non-Halal ❌' },
      ],
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Rencanakan Perjalanan Anda 🗺️
        </h1>
        <p className="text-gray-500">
          Isi detail perjalanan untuk mendapatkan rekomendasi rute terbaik.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="space-y-6">
              {/* Starting Position */}
              <LocationPicker
                lat={watch('start_lat')}
                lng={watch('start_long')}
                onChange={(lat, lng, name) => {
                  setValue('start_lat', lat, { shouldValidate: true });
                  setValue('start_long', lng, { shouldValidate: true });
                  if (name) {
                    setValue('start_location_name', name, { shouldValidate: true });
                  }
                }}
                onUseCurrentLocation={handleGetCurrentLocation}
                locating={locating}
              />

              <div className="border-t border-gray-100" />

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Waktu Mulai
                </label>
                <input
                  {...register('start_time')}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Waktu Berakhir
                </label>
                <input
                  {...register('end_time')}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Maksimal Kunjungan
                </label>
                <input
                  {...register('max_places', { valueAsNumber: true })}
                  type="number"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
              </div>

              <div
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 transition-all hover:bg-emerald-100"
                onClick={() =>
                  setValue('return_to_start', !watch('return_to_start'))
                }
              >
                <div className="flex h-5 items-center">
                  <input
                    {...register('return_to_start')}
                    type="checkbox"
                    id="return_to_start"
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex flex-col">
                  <label
                    htmlFor="return_to_start"
                    className="cursor-pointer text-sm font-bold text-emerald-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Kembali ke Lokasi Awal
                  </label>
                  <p className="mt-0.5 text-xs font-normal text-emerald-700">
                    Jadwalkan rute kembali ke titik awal di akhir perjalanan.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">
                  Preferensi Tempat
                </label>
                {prefGroups.map((group) => (
                  <div
                    key={group.category}
                    className="space-y-2 rounded-xl bg-gray-50 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => handlePrefChange(group.category)}
                      className={`text-xs font-black uppercase tracking-wider transition-colors ${
                        selectedPrefs.includes(group.category)
                          ? 'text-emerald-700'
                          : 'text-gray-400'
                      }`}
                    >
                      {group.label}
                    </button>
                    <div className="flex flex-wrap gap-1.5">
                      {group.types.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handlePrefChange(type.id)}
                          className={`rounded-lg border px-3 py-1 text-[10px] font-bold transition-all ${
                            selectedPrefs.includes(type.id)
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {errors.preferences && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.preferences.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? 'Mengoptimalkan Rute...' : 'Buat Rekomendasi'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
              <div className="mb-4 text-5xl">📍</div>
              <h3 className="text-lg font-bold text-gray-900">
                Belum Ada Rencana
              </h3>
              <p className="mx-auto max-w-xs text-sm text-gray-500">
                Silakan isi form di samping untuk membuat itinerary perjalanan
                Anda.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              <p className="mt-4 text-sm font-medium text-gray-600">
                Sedang menyusun rute terbaik untuk Anda...
              </p>
            </div>
          )}

          {result && result.itinerary.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Total Jarak
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {result.total_distance.toFixed(2)} km
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Total Durasi
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    {Math.floor(result.total_duration / 3600)} jam{' '}
                    {Math.floor((result.total_duration % 3600) / 60)} menit
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Rata-Rata Rating
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-700">
                    ⭐{' '}
                    {result.average_rating
                      ? result.average_rating.toFixed(3)
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Peta Rute */}
              <TripMap
                itinerary={result.itinerary}
                geometry={result.geometry}
                return_geometry={result.return_geometry}
              />

              <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${currentSeed === 0 ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}
                  >
                    {currentSeed === 0
                      ? '⭐ Peringkat #1'
                      : `Peringkat #${currentSeed + 1}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {currentSeed === 0
                      ? 'Kombinasi paling optimal saat ini'
                      : 'Kombinasi alternatif berikutnya'}
                  </span>
                </div>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm active:scale-95 disabled:opacity-50"
                >
                  🔄 Regenerate
                </button>
              </div>
              <div className="relative space-y-4">
                <div className="absolute bottom-4 left-4 top-4 w-0.5 bg-gray-200" />
                {result.itinerary.map((item, index) => (
                  <div key={item.place.id} className="relative pl-10">
                    <div className="absolute left-2.5 top-2 h-3.5 w-3.5 rounded-full bg-emerald-600 ring-4 ring-emerald-50" />
                    <div
                      onClick={() => {
                        if (
                          item.place.type !== 'Starting Point' &&
                          item.place.type !== 'End Point'
                        ) {
                          handleOpenReplaceModal(index, item.place);
                        }
                      }}
                      className={`group ${item.place.type !== 'Starting Point' && item.place.type !== 'End Point' ? 'cursor-pointer hover:border-emerald-200 hover:shadow-md' : 'cursor-default'} rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all`}
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                item.activity_label?.includes('Sarapan')
                                  ? 'bg-orange-50 text-orange-700'
                                  : item.activity_label?.includes('Siang')
                                    ? 'bg-amber-50 text-amber-700'
                                    : item.activity_label?.includes('Malam')
                                      ? 'bg-indigo-50 text-indigo-700'
                                      : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {item.activity_label || item.place.type}
                            </span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-500">
                              {item.place.type}
                            </span>
                            <span className="text-xs text-gray-400">
                              {index === 0
                                ? 'Titik Pertama'
                                : `${item.distance_from_previous.toFixed(2)} km dari sebelumnya`}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <h4 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
                              {item.place.name}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.place.id, item.place.name);
                              }}
                              className={`text-xl transition-all hover:scale-125 ${favorites.includes(item.place.id) ? 'text-rose-500' : 'text-gray-300'} ${item.place.type === 'Starting Point' || item.place.type === 'End Point' ? 'hidden' : ''}`}
                            >
                              {favorites.includes(item.place.id) ? '❤️' : '🤍'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">
                            {item.place.category}
                          </p>
                          <div className="mt-1 flex items-center gap-4">
                            {item.place.type !== 'Starting Point' &&
                              item.place.type !== 'End Point' && (
                                <p className="text-xs font-bold text-emerald-600">
                                  ⭐ {item.place.rating}
                                </p>
                              )}
                            {item.place.type !== 'Starting Point' &&
                              item.place.type !== 'End Point' && (
                                <span className="rounded-lg border border-gray-200 px-3 py-1 text-[10px] font-bold text-gray-600 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-700">
                                  🔄 Ganti Tempat
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-6 border-l border-gray-100 pl-6 sm:mt-0">
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Tiba
                            </p>
                            <p className="text-sm font-black text-gray-900">
                              {item.arrival_time === 0
                                ? '-'
                                : new Date(
                                    item.arrival_time * 1000
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase text-gray-400">
                              Pergi
                            </p>
                            <p className="text-sm font-black text-gray-900">
                              {new Date(
                                item.departure_time * 1000
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveTrip}
                  disabled={saving}
                  className="rounded-full bg-gray-950 px-8 py-3 text-sm font-bold text-white shadow-xl transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Trip Ini'}
                </button>
              </div>
            </div>
          ) : (
            result && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 py-10 text-center">
                <div className="mb-2 text-4xl">⚠️</div>
                <h3 className="text-lg font-bold text-amber-900">
                  Tidak Menemukan Tempat
                </h3>
                <p className="mx-auto max-w-xs text-sm text-amber-700">
                  Coba perbesar rentang waktu atau pilih preferensi lain yang
                  sesuai dengan data lokasi Anda.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Replacement Modal */}
      {replaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ganti Tempat 🔄
                </h2>
                <p className="text-xs text-gray-500">
                  Pilih destinasi alternatif untuk menggantikan slot ini.
                </p>
              </div>
              <button
                onClick={() => setReplaceModalOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col space-y-4 overflow-hidden p-6">
              <div className="flex shrink-0 flex-col gap-3">
                <input
                  type="text"
                  placeholder="Cari nama tempat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
                />
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      fetchAlternatives(altTypeFilter, altCategoryFilter);
                    }}
                    className="whitespace-nowrap rounded-full bg-emerald-100 px-4 py-1.5 text-[10px] font-bold text-emerald-700"
                  >
                    Tipe: {altTypeFilter}
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      fetchAlternatives('', altCategoryFilter);
                    }}
                    className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Kategori: {altCategoryFilter}
                  </button>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      fetchAlternatives('', '');
                    }}
                    className="whitespace-nowrap rounded-full bg-gray-100 px-4 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>

              {alternativesLoading ? (
                <div className="grow py-20 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                  <p className="mt-4 text-xs text-gray-500">
                    Mencari alternatif...
                  </p>
                </div>
              ) : (
                <div className="grow space-y-3 overflow-y-auto pr-2">
                  {filteredAlternatives.length > 0 ? (
                    filteredAlternatives.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          handleReplacePlace(p);
                          setSearchTerm('');
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 p-4 transition-all hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {p.type} • {p.category}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-600">
                              ⭐ {p.rating}
                            </span>
                            {p.distance !== undefined && (
                              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                📍 {p.distance.toFixed(1)} km dari titik
                                sebelumnya
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 group-hover:bg-emerald-100">
                          Pilih →
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-sm text-gray-500">
                        Tidak ada alternatif yang ditemukan.
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-2 text-xs font-bold text-emerald-600 underline"
                        >
                          Hapus pencarian
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
