"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Map } from '@/types/api-types';
import type { MapConfig } from '@/types/map-config';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  map: Map;
}

export function MapPreview({ map }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current.invalidateSize();
        }, 200);
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      setLoading(true);
      setError(null);

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapInstanceRef.current = null;
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!mapRef.current) return;

      try {
        const { mapLayout } = await import('@/lib/mapUtils');

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
            sourceType: layer.sourceType || 'url',
            url: layer.sourceUrl,
            data: layer.geoJsonData || null,
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
    <div
      ref={containerRef}
      className="w-full h-full min-h-[600px] rounded-lg border overflow-hidden relative bg-gray-100"
    >
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

      <Button
        variant="outline"
        size="icon-sm"
        onClick={toggleFullscreen}
        className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        title={isFullscreen ? 'צא ממסך מלא' : 'מסך מלא'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      <div ref={mapRef} className={`w-full ${isFullscreen ? 'h-screen' : 'h-full min-h-[600px]'}`} />
    </div>
  );
}
