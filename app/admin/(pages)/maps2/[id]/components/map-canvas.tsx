"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Pane,
  useMapEvents,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import type { PathOptions } from "leaflet";
import { useDataStudio, BASEMAPS, type StudioLayer } from "../store";
import type { Feature, FeatureCollection } from "geojson";
import type { PolygonStyleConfig, PointStyleConfig } from "@/types/map-config";
import "leaflet/dist/leaflet.css";

function isPolygonStyle(style: PolygonStyleConfig | PointStyleConfig): style is PolygonStyleConfig {
  return "default_color" in style;
}

function isPointStyle(style: PolygonStyleConfig | PointStyleConfig): style is PointStyleConfig {
  return "fillColor" in style;
}

function sanitizeGeoJson(data: FeatureCollection): FeatureCollection {
  return {
    ...data,
    features: data.features.filter((f) => {
      if (!f.geometry) return false;
      if ("coordinates" in f.geometry) {
        const coords = f.geometry.coordinates;
        if (!coords || (Array.isArray(coords) && coords.length === 0)) return false;
      }
      return true;
    }),
  };
}

function useDebouncedKey(parts: unknown[], delayMs: number): string {
  const serialized = JSON.stringify(parts);
  const [debouncedKey, setDebouncedKey] = useState(serialized);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedKey(serialized), delayMs);
    return () => clearTimeout(timerRef.current);
  }, [serialized, delayMs]);

  return debouncedKey;
}

function MapViewController() {
  const { dispatch } = useDataStudio();

  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter();
      dispatch({ type: "SET_CENTER", center: [c.lat, c.lng] });
    },
    zoomend: (e) => {
      dispatch({ type: "SET_ZOOM", zoom: e.target.getZoom() });
    },
  });

  return null;
}

function getPolygonStyle(style: PolygonStyleConfig, opacity: number, feature?: Feature): PathOptions {
  let fillColor = style.default_color || "#3388ff";

  if (style.type === "category" && style.field && style.color_dict && feature) {
    const val = String((feature.properties as Record<string, unknown>)?.[style.field] ?? "");
    if (style.color_dict[val]) {
      fillColor = style.color_dict[val];
    }
  }

  return {
    fillColor,
    fillOpacity: (style.opacity ?? 0.2) * opacity,
    weight: style.weight ?? 2,
    color: style.color || fillColor,
    opacity,
  };
}

function PolygonLayer({ layer }: { layer: StudioLayer }) {
  const debouncedKey = useDebouncedKey(
    [layer.id, layer.style, layer.opacity, layer.labels],
    250
  );

  if (!layer.geoJsonData || !layer.visible) return null;

  const style = isPolygonStyle(layer.style) ? layer.style : null;
  if (!style) return null;

  const safeData = sanitizeGeoJson(layer.geoJsonData);
  if (safeData.features.length === 0) return null;

  const onEachFeature = (feature: Feature, leafletLayer: L.Layer) => {
    if (layer.labels?.show && layer.labels.field) {
      const val = (feature.properties as Record<string, unknown>)?.[layer.labels.field];
      if (val != null) {
        (leafletLayer as L.Path).bindTooltip(String(val), {
          permanent: true,
          direction: layer.labels.position || "center",
          className: "studio-label",
        });
      }
    }
  };

  return (
    <GeoJSON
      key={debouncedKey}
      data={safeData}
      style={(feature) => getPolygonStyle(style, layer.opacity, feature)}
      onEachFeature={onEachFeature}
    />
  );
}

function PointLayer({ layer }: { layer: StudioLayer }) {
  if (!layer.geoJsonData || !layer.visible) return null;

  const style = isPointStyle(layer.style) ? layer.style : null;
  if (!style) return null;

  const safeData = sanitizeGeoJson(layer.geoJsonData);

  return (
    <>
      {safeData.features.map((feature, i) => {
        const geom = feature.geometry;
        if (geom.type !== "Point" || !("coordinates" in geom)) return null;

        const coords = geom.coordinates;
        if (!coords || coords.length < 2) return null;

        const [lng, lat] = coords;
        const props = (feature.properties ?? {}) as Record<string, unknown>;

        let fillColor = style.fillColor || "#ff7800";
        if (style.type === "category" && style.field && style.color_dict) {
          const val = String(props[style.field] ?? "");
          if (style.color_dict[val]) fillColor = style.color_dict[val];
        }

        return (
          <CircleMarker
            key={`${layer.id}_pt_${i}`}
            center={[lat, lng]}
            radius={style.radius ?? 4}
            pathOptions={{
              fillColor,
              color: style.color || "#000",
              weight: style.weight ?? 0.5,
              fillOpacity: (style.fillOpacity ?? 0.8) * layer.opacity,
              opacity: layer.opacity,
            }}
          >
            {layer.labels?.show && layer.labels.field && props[layer.labels.field] != null && (
              <Tooltip
                permanent
                direction={layer.labels.position || "right"}
                offset={[8, 0]}
                className="studio-label"
              >
                {String(props[layer.labels.field])}
              </Tooltip>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
}

export function MapCanvas() {
  const { state } = useDataStudio();
  const basemap = BASEMAPS[state.basemap] || BASEMAPS["carto-voyager"];

  const sortedLayers = useMemo(
    () => [...state.layers].sort((a, b) => a.zIndex - b.zIndex),
    [state.layers]
  );

  return (
    <>
      <style jsx global>{`
        .studio-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          padding: 0 !important;
          color: #1a1a1a !important;
          text-shadow:
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff;
        }
        .studio-label::before {
          display: none !important;
        }
        .leaflet-container {
          background: #f8fafc;
          font-family: inherit;
        }
      `}</style>

      <MapContainer
        center={state.center}
        zoom={state.zoom}
        minZoom={3}
        maxZoom={19}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer url={basemap.url} attribution={basemap.attribution} />
        <MapViewController />

        {sortedLayers.map((layer) => {
          if (!layer.visible || !layer.geoJsonData) return null;

          const paneZ = 400 + layer.zIndex;
          const paneName = `studio-layer-${layer.id}`;

          return (
            <Pane key={paneName} name={paneName} style={{ zIndex: paneZ }}>
              {layer.type === "POINTS" ? (
                <PointLayer layer={layer} />
              ) : (
                <PolygonLayer layer={layer} />
              )}
            </Pane>
          );
        })}
      </MapContainer>
    </>
  );
}
