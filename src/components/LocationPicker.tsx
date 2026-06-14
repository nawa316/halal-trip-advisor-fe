import React, { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  onUseCurrentLocation: () => void;
  locating: boolean;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

export default function LocationPicker({
  lat,
  lng,
  onChange,
  onUseCurrentLocation,
  locating,
}: LocationPickerProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'map' | 'manual'>(
    'search'
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => crypto.randomUUID());

  // Debounce search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2 && mapboxToken) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
              searchQuery
            )}&access_token=${mapboxToken}&session_token=${sessionToken}&types=poi,address`
          );
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        } catch (error) {
          console.error('Error fetching Mapbox suggestions:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectSuggestion = async (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);

    try {
      const res = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${mapboxToken}&session_token=${sessionToken}`
      );
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].geometry.coordinates;
        onChange(latitude, longitude);
      }
      // Reset session token after a successful retrieve
      setSessionToken(crypto.randomUUID());
    } catch (error) {
      console.error('Error retrieving Mapbox coordinates:', error);
    }
  };

  const handleMapClick = (e: any) => {
    onChange(e.lngLat.lat, e.lngLat.lng);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700">
          Titik Awal Perjalanan
        </label>
        <p className="mt-1 text-[11px] leading-snug text-gray-500">
          Secara default, lokasi awal disetel di{' '}
          <span className="font-semibold text-emerald-700">
            Bandara Internasional I Gusti Ngurah Rai Bali
          </span>
          . Anda dapat mengubahnya menggunakan opsi di bawah.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔍 Cari Lokasi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
            activeTab === 'map'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🗺️ Pilih di Peta
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all ${
            activeTab === 'manual'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⌨️ Manual
        </button>
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        {activeTab === 'search' && (
          <div className="relative space-y-3">
            <div>
              <p className="mb-1 text-[10px] font-bold text-gray-400 uppercase">
                Ketik Alamat atau Nama Tempat
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Contoh: Monas, Jakarta"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                />
                {isSearching && (
                  <div className="absolute top-2.5 right-3 h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute right-0 left-0 z-10 mt-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.mapbox_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full border-b border-gray-50 px-4 py-2.5 text-left text-sm last:border-0 hover:bg-emerald-50"
                  >
                    <p className="font-bold text-gray-900">{suggestion.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {suggestion.full_address || suggestion.place_formatted}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                disabled={locating}
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
              >
                {locating ? 'Mencari Lokasi...' : '📍 Gunakan Lokasi Saat Ini'}
              </button>
            </div>

            {lat !== 0 && lng !== 0 && (
              <p className="text-center text-[10px] text-gray-500">
                Koordinat terpilih: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-3">
            <div className="relative h-[250px] w-full overflow-hidden rounded-lg border border-gray-200">
              {!mapboxToken ? (
                <div className="flex h-full items-center justify-center bg-gray-50 p-4 text-center text-xs text-red-500">
                  Mapbox Token tidak ditemukan di .env.local
                  (NEXT_PUBLIC_MAPBOX_API_KEY)
                </div>
              ) : (
                <Map
                  mapboxAccessToken={mapboxToken}
                  initialViewState={{
                    longitude: lng,
                    latitude: lat,
                    zoom: 12,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  onClick={handleMapClick}
                  cursor="crosshair"
                >
                  <Marker longitude={lng} latitude={lat} color="#059669" />
                </Map>
              )}
            </div>

            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={locating}
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
            >
              {locating ? 'Mencari Lokasi...' : '📍 Gunakan Lokasi Saat Ini'}
            </button>
            <p className="text-center text-[10px] text-gray-500">
              Ketuk pada peta untuk memilih lokasi.
            </p>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Latitude
                </p>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) =>
                    onChange(parseFloat(e.target.value) || 0, lng)
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Longitude
                </p>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) =>
                    onChange(lat, parseFloat(e.target.value) || 0)
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-emerald-500 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={locating}
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 disabled:opacity-50"
            >
              {locating ? 'Mencari Lokasi...' : '📍 Gunakan Lokasi Saat Ini'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
