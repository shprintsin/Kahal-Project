"use client";

import { useEffect, useRef, useState } from 'react';
import type { Map } from '@/types/api-types';
import type { MapConfig } from '@/types/map-config';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  map: Map;
}

export function MapPreview({ map }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      setLoading(true);
      setError(null);

      // Clean up existing map FIRST
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapInstanceRef.current = null;
      }

      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mapRef.current) return;

      try {
        // Dynamically import Leaflet and mapLayout to avoid SSR issues
        const { mapLayout } = await import('@/lib/mapUtils');

        // Transform API map data to MapConfig format
        const mapConfig: MapConfig = {
          tile: map.config?.tile || {
            src: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            maxZoom: 18,
            subdomains: 'abc',
            attribution: '© OpenStreetMap contributors'
          },
          zoom: map.config?.zoom || 6,
          center: map.config?.center || [52.0, 20.0],
          layers: (map.layers || []).map(layer => ({
            id: layer.id,
            name: layer.name,
            type: layer.type === 'POINTS' ? 'point' : 'polygon',
            sourceType: layer.sourceType || 'url', // Add sourceType
            url: layer.sourceUrl,
            data: layer.geoJsonData || null, // Add GeoJSON data from database
            visible: layer.isVisibleByDefault,
            style: layer.styleConfig?.style || (layer.type === 'POINTS' ? {
              type: 'simple',
              radius: 6,
              fillColor: '#3388ff',
              color: '#fff',
              weight: 1,
              fillOpacity: 0.8
            } : {
              type: 'simple',
              default_color: '#3388ff',
              opacity: 0.6,
              weight: 1,
              color: '#fff'
            }),
            labels: layer.styleConfig?.labels,
            popup: layer.styleConfig?.popup,
            filter: layer.styleConfig?.filter,
          })),
          customCSS: map.config?.customCSS
        };

        // Create new map
        mapInstanceRef.current = await mapLayout(mapRef.current, mapConfig);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to load map. Please try again later.");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error in cleanup:", e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [map]);

  return (
    <div className="w-full h-full min-h-[600px] rounded-lg border overflow-hidden relative bg-gray-100">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען מפה...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center text-red-700 p-6">
            <p className="font-semibold mb-2">שגיאה בטעינת המפה</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[600px]" />
    </div>
  );
}
