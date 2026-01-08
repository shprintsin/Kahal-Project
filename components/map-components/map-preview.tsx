"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { MapConfig } from '../../app/admin/maps/types/config.types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapPreviewProps {
  config: MapConfig;
}

export interface MapPreviewHandle {
  getMapInstance: () => L.Map | null;
}

export const MapPreview = forwardRef<MapPreviewHandle, MapPreviewProps>(({ config }, ref) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Expose the map instance to parent via ref
  useImperativeHandle(ref, () => ({
    getMapInstance: () => mapInstanceRef.current
  }));

  useEffect(() => {
    // Dynamically import mapLayout to avoid SSR issues with Leaflet
    const initMap = async () => {
       if (!mapRef.current) return;

       // Clean up existing map FIRST
       if (mapInstanceRef.current) {
         try {
           mapInstanceRef.current.remove();
         } catch (e) {
           console.warn("Error removing map:", e);
         }
         mapInstanceRef.current = null;
       }

       // Clear Leaflet's internal reference to the container
       // This is necessary because Leaflet stores a reference on the DOM element itself
       const container = mapRef.current;
       if ((container as any)._leaflet_id) {
         delete (container as any)._leaflet_id;
       }

       // Small delay to ensure DOM is ready
       await new Promise(resolve => setTimeout(resolve, 100));

       if (!mapRef.current) return; // Check again after delay

       const { mapLayout } = await import('../../app/admin/maps/utils/mapUtils'); 

       // Create new map (now async)
       try {
         mapInstanceRef.current = await mapLayout(mapRef.current, config);
       } catch (error) {
         console.error("Error initializing map:", error);
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
  }, [config]);

  return (
    <div className="w-full h-full min-h-[500px] rounded-lg border overflow-hidden relative z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
});

MapPreview.displayName = 'MapPreview';
