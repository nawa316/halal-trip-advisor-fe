import React, { useMemo, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ScheduledPlace } from '@/libs/TripService';

interface TripMapProps {
  itinerary: ScheduledPlace[];
  geometry?: any;
  return_geometry?: any;
}

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

export default function TripMap({
  itinerary,
  geometry,
  return_geometry,
}: TripMapProps) {
  const [showReturnPath, setShowReturnPath] = useState(true);

  const geojson = useMemo(() => {
    if (geometry) {
      return {
        type: 'Feature',
        properties: {},
        geometry: geometry,
      };
    }
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: itinerary.map((item) => [
          item.place.longitude,
          item.place.latitude,
        ]),
      },
    };
  }, [itinerary, geometry]);

  const returnGeojson = useMemo(() => {
    if (!return_geometry) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: return_geometry,
    };
  }, [return_geometry]);

  if (!mapboxToken) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
        Mapbox Token tidak ditemukan di .env.local
      </div>
    );
  }

  if (itinerary.length === 0) return null;

  // Calculate center of the bounds
  const minLng = Math.min(...itinerary.map((i) => i.place.longitude));
  const maxLng = Math.max(...itinerary.map((i) => i.place.longitude));
  const minLat = Math.min(...itinerary.map((i) => i.place.latitude));
  const maxLat = Math.max(...itinerary.map((i) => i.place.latitude));

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  // Rough calculation for zoom level based on coordinate span
  const lngDiff = maxLng - minLng;
  const latDiff = maxLat - minLat;
  const maxDiff = Math.max(lngDiff, latDiff);
  let zoom = 12;
  if (maxDiff > 1) zoom = 8;
  else if (maxDiff > 0.5) zoom = 9;
  else if (maxDiff > 0.1) zoom = 10;
  else if (maxDiff > 0.05) zoom = 11;
  else zoom = 12;

  return (
    <div className="relative z-0 h-[400px] w-full overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: centerLng,
          latitude: centerLat,
          zoom: zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <NavigationControl position="bottom-right" />

        <Source id="route" type="geojson" data={geojson as any}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': '#059669', // Emerald-600
              'line-width': 4,
              'line-dasharray': [2, 2],
            }}
          />
        </Source>

        {showReturnPath && returnGeojson && (
          <Source id="return-route" type="geojson" data={returnGeojson as any}>
            <Layer
              id="return-route-line"
              type="line"
              paint={{
                'line-color': '#e11d48', // Rose-600
                'line-width': 4,
                'line-dasharray': [2, 2],
              }}
            />
          </Source>
        )}

        {itinerary.map((item, idx) => (
          <Marker
            key={`${item.place.id}-${idx}`}
            longitude={item.place.longitude}
            latitude={item.place.latitude}
            anchor="bottom"
          >
            <div className="group relative flex cursor-pointer flex-col items-center">
              <div className="pointer-events-none absolute -top-8 z-10 flex whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {idx + 1}. {item.place.name}
              </div>
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-black shadow-md ${
                  idx === 0
                    ? 'bg-blue-600 text-white' // Starting point
                    : idx === itinerary.length - 1
                      ? 'bg-rose-600 text-white' // Ending point
                      : 'bg-emerald-600 text-white'
                }`}
              >
                {idx + 1}
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {return_geometry && (
        <div className="absolute left-4 top-4 z-10">
          <button
            onClick={() => setShowReturnPath(!showReturnPath)}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:text-emerald-600"
          >
            <div
              className={`h-3 w-3 rounded-full ${showReturnPath ? 'bg-rose-600' : 'bg-gray-300'}`}
            />
            {showReturnPath
              ? 'Sembunyikan Jalur Pulang'
              : 'Tampilkan Jalur Pulang'}
          </button>
        </div>
      )}
    </div>
  );
}
