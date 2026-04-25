"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  Map as MapGL,
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
} from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { FeatureCollection } from 'geojson';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MapDataset as MapType, MapLayer } from '@/lib/view-types';
import type {
  MapConfig,
  LayerConfig,
  BehaviorsConfig,
  PolygonStyleConfig,
  PointStyleConfig,
} from '@/types/map-config';
import {
  compileMapConfig,
  type CompiledMapConfig,
} from '@/lib/maplibre-renderer';
import { resolveBasemapTile } from '@/lib/basemaps';
import { Legend } from './Legend';
import type { LegendLayerInput } from './Legend';
import { LayerToggle, toggleLayerVisibility } from './LayerToggle';
import type { LayerToggleItem } from './LayerToggle';
import { AttributeFilterToggle } from './AttributeFilterToggle';
import type { AttributeFilterItem } from './AttributeFilterToggle';
import { SearchControl } from './SearchControl';
import type { SearchFeature } from './SearchControl';
import { HoverInfoPanel } from './HoverInfoPanel';
import type { HoverData } from './HoverInfoPanel';
import { MapPopup, type FeaturePopupData } from './MapPopup';

// ─── Props ──────────────────────────────────────

interface MapPreviewProps {
  map: MapType;
  locale?: string;
}

// ─── GeoJSON cache ──────────────────────────────

const geoJsonCache = new Map<string, FeatureCollection>();

async function fetchGeoJSON(url: string): Promise<FeatureCollection> {
  const cached = geoJsonCache.get(url);
  if (cached) return cached;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
  const data = (await response.json()) as FeatureCollection;
  geoJsonCache.set(url, data);
  return data;
}

// ─── API-to-LayerConfig converter ───────────────

function buildLayerConfig(layer: MapLayer): LayerConfig {
  const styleConfig = layer.styleConfig as Record<string, unknown> | null;

  const rawStyle = (styleConfig?.style ?? (styleConfig?.type ? styleConfig : null)) as
    | PolygonStyleConfig
    | PointStyleConfig
    | null;

  const defaultPolygonStyle: PolygonStyleConfig = {
    type: 'simple', default_color: '#3388ff', opacity: 0.6, weight: 1, color: '#fff',
  };
  const defaultPointStyle: PointStyleConfig = {
    type: 'simple', radius: 6, fillColor: '#3388ff', color: '#fff', weight: 1, fillOpacity: 0.8,
  };

  const layerType = layer.type === 'POINTS' ? 'point' : 'polygon';
  const interactionConfig = layer.interactionConfig as Record<string, unknown> | null;

  return {
    id: layer.id,
    name: layer.name,
    type: layerType,
    sourceType: layer.sourceType || 'url',
    url: layer.sourceUrl,
    data: (layer.geoJsonData as FeatureCollection | null) || null,
    visible: layer.isVisibleByDefault,
    zIndex: layer.zIndex,
    style: rawStyle ?? (layerType === 'point' ? defaultPointStyle : defaultPolygonStyle),
    labels: (styleConfig?.labels as unknown as LayerConfig['labels']) ??
      (styleConfig && typeof styleConfig === 'object' && 'show' in styleConfig
        ? (styleConfig as unknown as LayerConfig['labels']) : undefined),
    popup: styleConfig?.popup as unknown as LayerConfig['popup'],
    filter: (styleConfig?.filter as unknown as LayerConfig['filter']) ??
      (styleConfig && typeof styleConfig === 'object' && 'field' in styleConfig && 'include' in styleConfig
        ? (styleConfig as unknown as LayerConfig['filter']) : undefined),
    hover: (styleConfig?.hover as unknown as LayerConfig['hover']) ??
      (interactionConfig?.hover as unknown as LayerConfig['hover']),
    minZoom: styleConfig?.minZoom as number | undefined,
    maxZoom: styleConfig?.maxZoom as number | undefined,
    feature_id: styleConfig?.feature_id as string | undefined,
  };
}

// ─── Resolve source URL ─────────────────────────

function resolveLayerSourceUrl(layerConfig: LayerConfig): string | null {
  if (layerConfig.sourceType === 'database' && layerConfig.id) {
    const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || '';
    return `${apiUrl}/api/geo/geojson/${layerConfig.id}`;
  }
  return layerConfig.url ?? null;
}

// ─── Centroid helper for search flyTo ───────────

function computeCentroid(geometry: GeoJSON.Geometry): [number, number] {
  if (geometry.type === 'Point') {
    return geometry.coordinates as [number, number];
  }
  let lngSum = 0;
  let latSum = 0;
  let count = 0;

  function accumulateCoords(coords: number[]) {
    lngSum += coords[0];
    latSum += coords[1];
    count++;
  }

  function walkRings(rings: number[][][]) {
    for (const c of rings[0]) accumulateCoords(c);
  }

  if (geometry.type === 'Polygon') {
    walkRings(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) walkRings(poly);
  } else if (geometry.type === 'MultiPoint') {
    for (const c of geometry.coordinates) accumulateCoords(c);
  } else if (geometry.type === 'LineString') {
    for (const c of geometry.coordinates) accumulateCoords(c);
  } else if (geometry.type === 'MultiLineString') {
    for (const ring of geometry.coordinates) for (const c of ring) accumulateCoords(c);
  }

  if (count === 0) return [0, 0];
  return [lngSum / count, latSum / count];
}

function computeOverallBbox(collections: FeatureCollection[]): [number, number, number, number] | null {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  function check(lng: number, lat: number) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  for (const fc of collections) {
    for (const feature of fc.features) {
      const geom = feature.geometry;
      if (!geom) continue;
      if (geom.type === 'Point') {
        check(geom.coordinates[0], geom.coordinates[1]);
      } else if (geom.type === 'MultiPoint' || geom.type === 'LineString') {
        for (const c of geom.coordinates) check(c[0], c[1]);
      } else if (geom.type === 'MultiLineString' || geom.type === 'Polygon') {
        for (const ring of geom.coordinates) for (const c of ring) check(c[0], c[1]);
      } else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) for (const ring of poly) for (const c of ring) check(c[0], c[1]);
      }
    }
  }

  return minLng === Infinity ? null : [minLng, minLat, maxLng, maxLat];
}

function computeBbox(geometry: GeoJSON.Geometry): [number, number, number, number] | undefined {
  if (geometry.type === 'Point') return undefined;
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  function checkCoord(c: number[]) {
    if (c[0] < minLng) minLng = c[0];
    if (c[1] < minLat) minLat = c[1];
    if (c[0] > maxLng) maxLng = c[0];
    if (c[1] > maxLat) maxLat = c[1];
  }

  function walkRings(rings: number[][][]) {
    for (const c of rings[0]) checkCoord(c);
  }

  if (geometry.type === 'Polygon') {
    walkRings(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) walkRings(poly);
  } else if (geometry.type === 'MultiPoint') {
    for (const c of geometry.coordinates) checkCoord(c);
  } else if (geometry.type === 'LineString') {
    for (const c of geometry.coordinates) checkCoord(c);
  } else if (geometry.type === 'MultiLineString') {
    for (const ring of geometry.coordinates) for (const c of ring) checkCoord(c);
  }

  if (minLng === Infinity) return undefined;
  return [minLng, minLat, maxLng, maxLat];
}

// ─── Component ──────────────────────────────────

export function MapPreview({ map, locale }: MapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Compiled config
  const [compiledConfig, setCompiledConfig] = useState<CompiledMapConfig | null>(null);
  const [autoBounds, setAutoBounds] = useState<[number, number, number, number] | null>(null);

  // Hover state
  const [hoverData, setHoverData] = useState<HoverData | null>(null);
  const [hoverLayerConfig, setHoverLayerConfig] = useState<LayerConfig | null>(null);
  const hoveredFeatureRef = useRef<{ sourceId: string; featureId: number | string } | null>(null);

  // Popup state
  const [popupData, setPopupData] = useState<FeaturePopupData | null>(null);

  // Layer toggle state
  const [layerToggleItems, setLayerToggleItems] = useState<LayerToggleItem[]>([]);

  // Attribute filter state — keyed by `${layerKey}::${field}`
  const [attributeFilterActive, setAttributeFilterActive] = useState<Record<string, boolean>>({});
  // Maps compiled layer ID → original filter expression (or undefined if none)
  const originalFiltersRef = useRef<Map<string, unknown>>(new Map());

  // Search features
  const [searchFeatures, setSearchFeatures] = useState<SearchFeature[]>([]);

  // Build layer configs from map data
  const layerConfigs = useMemo(
    () => (map.layers || []).map(buildLayerConfig),
    [map.layers],
  );

  // Behaviors from map config
  const mapConfigObj = map.config as Record<string, unknown> | null;
  const behaviors = mapConfigObj?.behaviors as BehaviorsConfig | undefined;
  const hasLegend = !!behaviors?.legend;
  const layerToggleControl = behaviors?.controls?.find((c) => c.type === 'layer-toggle');
  const searchControl = behaviors?.controls?.find((c) => c.type === 'search');
  const attributeFilterControls = useMemo(
    () => (behaviors?.controls || []).filter((c) => c.type === 'attribute-filter' && c.field),
    [behaviors?.controls],
  );
  const basemapKey = mapConfigObj?.basemap as string | undefined;

  // ─── Fullscreen ─────────────────────────────

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
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // ─── Fetch GeoJSON + Compile ────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadAndCompile() {
      setLoading(true);
      setError(null);

      try {
        const dataMap = new Map<string, FeatureCollection>();
        const allFeatures: SearchFeature[] = [];
        const searchField = searchControl?.field;

        // Fetch all layer data in parallel
        await Promise.all(layerConfigs.map(async (lc) => {
          const key = lc.id || lc.name;
          let geoData: FeatureCollection | null = lc.data ?? null;

          if (!geoData) {
            const url = resolveLayerSourceUrl(lc);
            if (url) geoData = await fetchGeoJSON(url);
          }

          if (geoData) {
            dataMap.set(key, geoData);

            // Collect features for search
            for (const feature of geoData.features) {
              const props = (feature.properties ?? {}) as Record<string, unknown>;
              const featureIdField = lc.feature_id || 'id';
              const fid = (props[featureIdField] as string | undefined) ??
                (feature.id != null ? String(feature.id) : `${key}-${allFeatures.length}`);
              const label = searchField ? String(props[searchField] ?? '') : String(fid);
              if (!label) continue;

              const geom = feature.geometry;
              const centroid = geom ? computeCentroid(geom) : [0, 0] as [number, number];
              const bbox = geom ? computeBbox(geom) : undefined;

              allFeatures.push({
                id: fid,
                label,
                coordinates: centroid as [number, number],
                bbox,
              });
            }
          }
        }));

        if (cancelled) return;

        // Build MapConfig for compiler
        const tileConfig = resolveBasemapTile(
          basemapKey,
          mapConfigObj?.tile as Parameters<typeof resolveBasemapTile>[1],
        );

        // Auto-fit: if no explicit center in config, compute the overall bbox of all loaded data.
        if (!mapConfigObj?.center) {
          const bbox = computeOverallBbox([...dataMap.values()]);
          setAutoBounds(bbox);
        } else {
          setAutoBounds(null);
        }

        const fullConfig: MapConfig & { basemap?: string } = {
          tile: tileConfig,
          zoom: (mapConfigObj?.zoom as number) || 6,
          center: (mapConfigObj?.center as [number, number]) || [52.0, 20.0],
          layers: layerConfigs,
          customCSS: mapConfigObj?.customCSS as string | undefined,
          behaviors,
          basemap: basemapKey,
        };

        const compiled = compileMapConfig(fullConfig, dataMap);

        if (cancelled) return;

        // Capture original filters per compiled sub-layer ID so attribute
        // filters can be AND-merged without clobbering layer-level filters.
        const origFilters = new Map<string, unknown>();
        for (const spec of compiled.layerSpecs) {
          for (const sub of spec.layers) {
            origFilters.set(sub.id, sub.filter);
          }
        }
        originalFiltersRef.current = origFilters;

        setCompiledConfig(compiled);
        setSearchFeatures(allFeatures);
        setLayerToggleItems(
          layerConfigs.map((l) => ({
            slug: l.id || l.name,
            name: l.name,
            visible: l.visible,
          })),
        );
        setLoading(false);
      } catch (err) {
        console.error('Error loading map data:', err);
        if (!cancelled) {
          setError('Failed to load map. Please try again later.');
          setLoading(false);
        }
      }
    }

    loadAndCompile();
    return () => { cancelled = true; };
  }, [map, layerConfigs, basemapKey, mapConfigObj, behaviors, searchControl?.field]);

  // ─── Interactive layer IDs ──────────────────

  const interactiveLayerIds = useMemo(() => {
    if (!compiledConfig) return [];
    const ids: string[] = [];
    for (const spec of compiledConfig.layerSpecs) {
      for (const layer of spec.layers) {
        if (layer.type === 'fill' || layer.type === 'circle') {
          ids.push(layer.id);
        }
      }
    }
    return ids;
  }, [compiledConfig]);

  // ─── Layer config lookup by compiled layer ID ─

  const layerConfigByCompiledId = useMemo(() => {
    const lookup = new Map<string, LayerConfig>();
    for (const lc of layerConfigs) {
      const key = lc.id || lc.name;
      lookup.set(`${key}-fill`, lc);
      lookup.set(`${key}-line`, lc);
      lookup.set(`${key}-circle`, lc);
      lookup.set(`${key}-labels`, lc);
    }
    return lookup;
  }, [layerConfigs]);

  // ─── Clear hover helper ───────────────────────

  const clearHover = useCallback(() => {
    const mapInstance = mapRef.current?.getMap();
    if (mapInstance && hoveredFeatureRef.current) {
      mapInstance.setFeatureState(
        { source: hoveredFeatureRef.current.sourceId, id: hoveredFeatureRef.current.featureId },
        { hover: false },
      );
      hoveredFeatureRef.current = null;
    }
    setHoverData(null);
    setHoverLayerConfig(null);
  }, []);

  // ─── Hover handler ────────────────────────────

  const onMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance) return;

      const features = event.features;
      if (!features || features.length === 0) {
        clearHover();
        return;
      }

      const topFeature = features[0];
      const layerId = topFeature.layer?.id;
      const lc = layerId ? layerConfigByCompiledId.get(layerId) : null;

      if (!lc?.hover?.enable) {
        clearHover();
        return;
      }

      const layerKey = lc.id || lc.name;
      const sourceId = `source-${layerKey}`;
      const featureId = topFeature.id;

      // Clear previous if different feature
      if (hoveredFeatureRef.current && (
        hoveredFeatureRef.current.sourceId !== sourceId ||
        hoveredFeatureRef.current.featureId !== featureId
      )) {
        mapInstance.setFeatureState(
          { source: hoveredFeatureRef.current.sourceId, id: hoveredFeatureRef.current.featureId },
          { hover: false },
        );
      }

      // Set new hover
      if (featureId != null) {
        mapInstance.setFeatureState(
          { source: sourceId, id: featureId },
          { hover: true },
        );
        hoveredFeatureRef.current = { sourceId, featureId };
      }

      setHoverData({
        properties: (topFeature.properties ?? {}) as Record<string, string | number | boolean | null>,
        position: { x: event.point.x, y: event.point.y },
        layerName: lc.name,
      });
      setHoverLayerConfig(lc);
    },
    [layerConfigByCompiledId, clearHover],
  );

  const onMouseLeave = useCallback(() => {
    clearHover();
  }, [clearHover]);

  // ─── Click (Popup) handler ────────────────────

  const onClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const features = event.features;
      if (!features || features.length === 0) {
        setPopupData(null);
        return;
      }

      const topFeature = features[0];
      const layerId = topFeature.layer?.id;
      const lc = layerId ? layerConfigByCompiledId.get(layerId) : null;

      if (!lc?.popup?.show) {
        setPopupData(null);
        return;
      }

      setPopupData({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
        properties: (topFeature.properties ?? {}) as Record<string, string | number | boolean | null>,
        layerName: lc.name,
        popupConfig: lc.popup,
      });
    },
    [layerConfigByCompiledId],
  );

  // ─── Layer toggle ─────────────────────────────

  const handleLayerToggle = useCallback((slug: string) => {
    setLayerToggleItems((prev) => {
      const next = toggleLayerVisibility(prev, slug);
      const item = next.find((l) => l.slug === slug);
      const mapInstance = mapRef.current?.getMap();
      if (!mapInstance) return next;

      const visibility = item?.visible ? 'visible' : 'none';
      const suffixes = ['-fill', '-line', '-circle', '-labels'];
      for (const suffix of suffixes) {
        try {
          mapInstance.setLayoutProperty(`${slug}${suffix}`, 'visibility', visibility);
        } catch {
          // Layer may not exist for this type
        }
      }
      return next;
    });
  }, []);

  // ─── Attribute filter ─────────────────────────

  // Resolve each control's `layer` (slug/name) → underlying compiled key
  const attributeFilterEntries = useMemo(() => {
    const layers = map.layers || [];
    return attributeFilterControls.flatMap((ctrl) => {
      if (!ctrl.field) return [];
      const target = layers.find((l) =>
        l.slug === ctrl.layer || l.id === ctrl.layer || l.name === ctrl.layer,
      );
      if (!target) return [];
      const layerKey = target.id || target.name;
      const key = `${layerKey}::${ctrl.field}`;
      const fallback = ctrl.field;
      const labelMap = ctrl.label;
      const label = labelMap
        ? (locale && labelMap[locale]) || labelMap.en || labelMap.he || fallback
        : fallback;
      return [{ key, layerKey, field: ctrl.field, label }];
    });
  }, [attributeFilterControls, map.layers, locale]);

  const attributeFilterItems = useMemo<AttributeFilterItem[]>(
    () => attributeFilterEntries.map((e) => ({
      key: e.key,
      label: e.label,
      active: !!attributeFilterActive[e.key],
    })),
    [attributeFilterEntries, attributeFilterActive],
  );

  const applyAttributeFilters = useCallback((nextActive: Record<string, boolean>) => {
    const mapInstance = mapRef.current?.getMap();
    if (!mapInstance) return;

    const byLayerKey = new Map<string, string[]>();
    for (const entry of attributeFilterEntries) {
      if (!nextActive[entry.key]) continue;
      const list = byLayerKey.get(entry.layerKey) ?? [];
      list.push(entry.field);
      byLayerKey.set(entry.layerKey, list);
    }

    const suffixes = ['-fill', '-line', '-circle', '-labels'] as const;
    const allLayerKeys = new Set(attributeFilterEntries.map((e) => e.layerKey));

    for (const layerKey of allLayerKeys) {
      const activeFields = byLayerKey.get(layerKey) ?? [];
      for (const suffix of suffixes) {
        const compiledId = `${layerKey}${suffix}`;
        const original = originalFiltersRef.current.get(compiledId);
        const fieldExprs = activeFields.map((f) => ['to-boolean', ['get', f]]);
        const parts: unknown[] = [];
        if (original !== undefined && original !== null) parts.push(original);
        parts.push(...fieldExprs);
        const merged: unknown =
          parts.length === 0 ? null :
          parts.length === 1 ? parts[0] :
          ['all', ...parts];
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- maplibre filter expression typing
          mapInstance.setFilter(compiledId, merged as any);
        } catch {
          // Sub-layer may not exist for this layer type
        }
      }
    }
  }, [attributeFilterEntries]);

  const handleAttributeFilterToggle = useCallback((key: string) => {
    setAttributeFilterActive((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      applyAttributeFilters(next);
      return next;
    });
  }, [applyAttributeFilters]);

  // Re-apply when the compiled config changes (e.g. on initial load)
  useEffect(() => {
    if (compiledConfig) applyAttributeFilters(attributeFilterActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compiledConfig]);

  // ─── Search select ────────────────────────────

  const handleSearchSelect = useCallback((feature: SearchFeature) => {
    if (!mapRef.current) return;
    if (feature.bbox) {
      const [w, s, e, n] = feature.bbox;
      mapRef.current.fitBounds([w, s, e, n], { padding: 50, maxZoom: 14, duration: 1500 });
    } else {
      mapRef.current.flyTo({
        center: feature.coordinates,
        zoom: 14,
        duration: 1500,
      });
    }
  }, []);

  // ─── Cursor ───────────────────────────────────

  const cursor = hoveredFeatureRef.current ? 'pointer' : 'pointer';

  // ─── Hover display config ─────────────────────

  const hoverFields = hoverLayerConfig?.hover?.panel?.fields;
  const hoverTemplate = hoverLayerConfig?.hover?.panel?.template;
  const hoverMode = hoverLayerConfig?.hover?.display ?? 'floating';

  // ─── Legend layers ────────────────────────────

  const legendLayers = useMemo<LegendLayerInput[]>(
    () =>
      (map.layers || [])
        .filter((l) => l.isVisibleByDefault !== false)
        .map((l) => {
          const cfg = buildLayerConfig(l);
          return { name: cfg.name, slug: cfg.id, style: cfg.style, type: cfg.type };
        }),
    [map.layers],
  );

  // ─── Render ───────────────────────────────────

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg border overflow-hidden relative bg-gray-100"
      style={{ height: isFullscreen ? '100vh' : 600 }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-center text-red-700 p-6">
            <p className="font-semibold mb-2">Error loading map</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {compiledConfig && (
        <MapGL
          ref={mapRef}
          initialViewState={
            !mapConfigObj?.center && autoBounds
              ? {
                  bounds: autoBounds,
                  fitBoundsOptions: { padding: 40, maxZoom: 12 },
                }
              : {
                  longitude: compiledConfig.center[1],
                  latitude: compiledConfig.center[0],
                  zoom: compiledConfig.zoom,
                }
          }
          style={{ width: '100%', height: isFullscreen ? '100vh' : '100%' }}
          mapStyle={compiledConfig.mapStyle}
          interactiveLayerIds={interactiveLayerIds}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          cursor={cursor}
          attributionControl={false}
        >
          <NavigationControl position="top-left" showCompass={false} />
          <ScaleControl position="bottom-left" />

          {compiledConfig.layerSpecs.map((spec) => (
            <Source
              key={spec.sourceId}
              id={spec.sourceId}
              type="geojson"
              data={spec.sourceData}
              generateId
            >
              {spec.layers.map((compiledLayer) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-map-gl Layer accepts dynamic paint/layout
                const layerProps = {
                  id: compiledLayer.id,
                  type: compiledLayer.type,
                  paint: compiledLayer.paint,
                  layout: compiledLayer.layout,
                  ...(compiledLayer.filter ? { filter: compiledLayer.filter } : {}),
                  ...(compiledLayer.minzoom != null ? { minzoom: compiledLayer.minzoom } : {}),
                  ...(compiledLayer.maxzoom != null ? { maxzoom: compiledLayer.maxzoom } : {}),
                } as React.ComponentProps<typeof Layer>;
                return <Layer key={compiledLayer.id} {...layerProps} />;
              })}
            </Source>
          ))}

          {popupData && (
            <MapPopup data={popupData} onClose={() => setPopupData(null)} />
          )}
        </MapGL>
      )}

      {/* Fullscreen button */}
      <Button
        variant="outline"
        size="icon-sm"
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>

      {/* Legend */}
      {!loading && hasLegend && (
        <Legend layers={legendLayers} config={behaviors!.legend!} />
      )}

      {/* Layer toggle */}
      {!loading && layerToggleControl && layerToggleItems.length > 1 && (
        <LayerToggle items={layerToggleItems} onToggle={handleLayerToggle} />
      )}

      {/* Attribute filter */}
      {!loading && attributeFilterItems.length > 0 && (
        <AttributeFilterToggle
          items={attributeFilterItems}
          onToggle={handleAttributeFilterToggle}
        />
      )}

      {/* Search */}
      {!loading && searchControl?.field && (
        <SearchControl
          features={searchFeatures}
          onSelect={handleSearchSelect}
        />
      )}

      {/* Hover info panel */}
      <HoverInfoPanel
        data={hoverData}
        mode={hoverMode}
        fields={hoverFields}
        template={hoverTemplate}
      />

      {/* OSM attribution */}
      <div className="absolute bottom-1 right-1 z-[1000] text-[10px] text-gray-700 bg-white/80 px-1 rounded pointer-events-auto">
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">
          © OpenStreetMap contributors
        </a>
      </div>
    </div>
  );
}
