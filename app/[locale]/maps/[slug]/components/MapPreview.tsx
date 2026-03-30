"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapDataset as MapType } from '@/types/api-types';
import type { MapConfig, LayerConfig, BehaviorsConfig } from '@/types/map-config';
import { resolveBasemapTile } from '@/lib/basemaps';
import type { MapLayoutResult } from '@/lib/mapUtils';
import { Legend } from './Legend';
import { LayerToggle, toggleLayerVisibility } from './LayerToggle';
import type { LayerToggleItem } from './LayerToggle';
import { SearchControl } from './SearchControl';
import { HoverInfoPanel } from './HoverInfoPanel';
import 'leaflet/dist/leaflet.css';

interface MapPreviewProps {
  map: MapType;
}

function buildLayerConfig(layer: MapType['layers'] extends (infer T)[] ? T : never): LayerConfig {
  return {
    id: layer.id,
    name: layer.name,
    type: layer.type === 'POINTS' ? 'point' : 'polygon',
    sourceType: layer.sourceType || 'url',
    url: layer.sourceUrl,
    data: layer.geoJsonData || null,
    visible: layer.isVisibleByDefault,
    zIndex: layer.zIndex,
    style: layer.styleConfig?.style
      || (layer.styleConfig?.type ? layer.styleConfig : null)
      || (layer.type === 'POINTS' ? {
        type: 'simple', radius: 6, fillColor: '#3388ff', color: '#fff', weight: 1, fillOpacity: 0.8
      } : {
        type: 'simple', default_color: '#3388ff', opacity: 0.6, weight: 1, color: '#fff'
      }),
    labels: layer.styleConfig?.labels || (layer.styleConfig?.show !== undefined ? layer.styleConfig : undefined),
    popup: layer.styleConfig?.popup,
    filter: layer.styleConfig?.filter || (layer.styleConfig?.field && layer.styleConfig?.include ? layer.styleConfig : undefined),
    hover: layer.styleConfig?.hover || layer.interactionConfig?.hover,
    minZoom: layer.styleConfig?.minZoom,
    maxZoom: layer.styleConfig?.maxZoom,
    feature_id: layer.styleConfig?.feature_id,
  };
}

export function MapPreview({ map }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerRefsRef = useRef<Record<string, any>>({});
  const allFeaturesRef = useRef<MapLayoutResult['allFeatures']>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hover state
  const [hoveredFeature, setHoveredFeature] = useState<Record<string, unknown> | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [hoverLayerConfig, setHoverLayerConfig] = useState<LayerConfig | null>(null);

  // Layer toggle state
  const [layerToggleItems, setLayerToggleItems] = useState<LayerToggleItem[]>([]);

  // Search features
  const [searchFeatures, setSearchFeatures] = useState<MapLayoutResult['allFeatures']>([]);

  // Behaviors from map config
  const behaviors: BehaviorsConfig | undefined = map.config?.behaviors;
  const hasLegend = !!behaviors?.legend;
  const layerToggleControl = behaviors?.controls?.find(c => c.type === 'layer-toggle');
  const searchControl = behaviors?.controls?.find(c => c.type === 'search');

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => console.warn('Fullscreen request failed:', err));
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (mapInstanceRef.current) {
        setTimeout(() => mapInstanceRef.current.invalidateSize(), 200);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Layer toggle handler
  const handleLayerToggle = useCallback((slug: string) => {
    setLayerToggleItems(prev => {
      const next = toggleLayerVisibility(prev, slug);
      const item = next.find(l => l.slug === slug);
      const leafletLayer = layerRefsRef.current[slug];
      if (leafletLayer && mapInstanceRef.current) {
        if (item?.visible) {
          if (!mapInstanceRef.current.hasLayer(leafletLayer)) mapInstanceRef.current.addLayer(leafletLayer);
        } else {
          if (mapInstanceRef.current.hasLayer(leafletLayer)) mapInstanceRef.current.removeLayer(leafletLayer);
        }
      }
      return next;
    });
  }, []);

  // Search select handler
  const handleSearchSelect = useCallback((featureId: string) => {
    const feature = allFeaturesRef.current.find(f => f.id === featureId);
    if (!feature?.geometry || !mapInstanceRef.current) return;
    try {
      const L = require('leaflet');
      const geojson = L.geoJSON({ type: 'Feature', geometry: feature.geometry, properties: {} });
      mapInstanceRef.current.fitBounds(geojson.getBounds(), { padding: [50, 50], maxZoom: 14 });
    } catch (e) {
      console.warn('Search fly-to failed:', e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current) return;

      setLoading(true);
      setError(null);

      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) { console.warn("Error removing map:", e); }
        mapInstanceRef.current = null;
      }

      const container = mapRef.current;
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      if (!mapRef.current || cancelled) return;

      try {
        const { mapLayout } = await import('@/lib/mapUtils');
        if (cancelled) return;

        const layerConfigs = (map.layers || []).map(buildLayerConfig);

        const mapConfig: MapConfig = {
          tile: resolveBasemapTile(map.config?.basemap, map.config?.tile),
          zoom: map.config?.zoom || 6,
          center: map.config?.center || [52.0, 20.0],
          layers: layerConfigs,
          customCSS: map.config?.customCSS,
          behaviors,
        };

        const mapContainerEl = mapRef.current;
        const result = await mapLayout(mapContainerEl, mapConfig, {
          onHover: (feature, position, _style, layerCfg) => {
            const rect = mapContainerEl.getBoundingClientRect();
            setHoveredFeature(feature);
            setHoverPosition({ x: position.x - rect.left, y: position.y - rect.top });
            setHoverLayerConfig(layerCfg);
          },
          onHoverEnd: () => {
            setHoveredFeature(null);
            setHoverPosition(null);
            setHoverLayerConfig(null);
          },
        });

        mapInstanceRef.current = result.map;
        layerRefsRef.current = result.layerRefs;
        allFeaturesRef.current = result.allFeatures;
        setSearchFeatures(result.allFeatures);

        // Initialize layer toggle items
        setLayerToggleItems(layerConfigs.map(l => ({
          slug: l.id || l.name,
          name: l.name,
          visible: l.visible,
        })));

        setLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Failed to load map. Please try again later.");
        setLoading(false);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) { console.warn("Error in cleanup:", e); }
        mapInstanceRef.current = null;
      }
    };
  }, [map]);

  // Determine hover display config from the hovered layer
  const hoverDisplay = hoverLayerConfig?.hover?.display ?? 'floating';
  const hoverFields = hoverLayerConfig?.hover?.panel?.fields;
  const hoverTemplate = hoverLayerConfig?.hover?.panel?.template;

  // Build legend layers from visible layer configs
  const legendLayers = (map.layers || [])
    .filter(l => l.isVisibleByDefault !== false)
    .map(l => {
      const cfg = buildLayerConfig(l);
      return { name: cfg.name, style: cfg.style };
    });

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

      {!loading && hasLegend && (
        <Legend layers={legendLayers} config={behaviors!.legend!} />
      )}

      {!loading && layerToggleControl && layerToggleItems.length > 1 && (
        <LayerToggle layers={layerToggleItems} onToggle={handleLayerToggle} />
      )}

      {!loading && searchControl?.field && (
        <SearchControl
          features={searchFeatures}
          searchField={searchControl.field}
          onSelect={handleSearchSelect}
        />
      )}

      <HoverInfoPanel
        mode={hoverDisplay}
        feature={hoveredFeature}
        fields={hoverFields}
        template={hoverTemplate}
        position={hoverPosition ?? undefined}
      />
    </div>
  );
}
