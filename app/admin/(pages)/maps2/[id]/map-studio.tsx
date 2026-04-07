"use client";

import { useReducer, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  DataStudioContext,
  dataStudioReducer,
  BASEMAPS,
  type DataStudioState,
  type StudioLayer,
} from "./store";
import { MapToolbar } from "./components/map-toolbar";
import { LayerPanel } from "./components/layer-panel";
import { StylePanel } from "./components/style-panel";
import { DetailsPanel } from "./components/details-panel";
import { StatusBar } from "./components/status-bar";
import { createMap, updateMap, type MapInput } from "@/app/admin/actions/maps";
import { createLayer } from "@/app/admin/actions/layers";
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from "@/components/map-components/default-styles";
import type { FeatureCollection } from "geojson";

const MapCanvas = dynamic(
  () => import("./components/map-canvas").then((m) => m.MapCanvas),
  { ssr: false, loading: () => <div className="flex-1 bg-muted animate-pulse" /> }
);

interface MapStudioProps {
  mapData: Record<string, unknown> | null;
  layerLibrary: { id: string; name: string; slug: string; type: string; featureCount: number }[];
  isNew: boolean;
  categories: { value: string; label: string }[];
  tags: { id: string; name: string }[];
  regions: { id: string; name: string }[];
}

function buildInitialState(mapData: Record<string, unknown> | null): DataStudioState {
  if (!mapData) {
    return {
      datasetId: null,
      title: "",
      slug: "",
      description: "",
      status: "draft",
      layers: [],
      selectedLayerId: null,
      center: [50.0, 24.0],
      zoom: 7,
      basemap: "carto-voyager",
      leftPanelOpen: true,
      rightPanelOpen: false,
      rightPanelMode: "style",
      isDirty: false,
      saving: false,
      year: null,
      yearMin: null,
      yearMax: null,
      period: "",
      version: "1.0.0",
      categoryId: "",
      tagIds: [],
      regionIds: [],
      thumbnailId: null,
      thumbnailUrl: null,
      referenceLinks: [],
    };
  }

  const config = (mapData.config as Record<string, unknown>) || {};
  const titleI18n = (mapData.titleI18n as Record<string, string>) || {};
  const descI18n = (mapData.descriptionI18n as Record<string, string>) || {};
  const mapLayers = (mapData.layers as Record<string, unknown>[]) || [];

  const layers: StudioLayer[] = mapLayers.map((assoc, i) => {
    const layer = (assoc.layer as Record<string, unknown>) || {};
    const geoData = (layer.geoJsonData as FeatureCollection) || null;
    const features = geoData?.features || [];
    const props = features.length > 0
      ? Object.keys((features[0].properties as Record<string, unknown>) || {})
      : [];

    const layerType = (layer.type as string) || "POLYGONS";
    const baseStyle = layerType === "POINTS" ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE;
    const styleOverrideObj = (assoc.styleOverride as Record<string, unknown>) || {};
    const savedStyle = (styleOverrideObj.style as Record<string, unknown>) || {};
    const savedLabels = (styleOverrideObj.labels as StudioLayer["labels"]) || null;
    const savedPopup = (styleOverrideObj.popup as StudioLayer["popup"]) || null;
    const savedFilter = (styleOverrideObj.filter as StudioLayer["filter"]) || null;

    return {
      id: (assoc.associationId as string) || (assoc.id as string) || `assoc_${i}`,
      layerId: (assoc.layerId as string) || (layer.id as string),
      name: (layer.name as string) || `Layer ${i + 1}`,
      type: layerType as StudioLayer["type"],
      visible: (assoc.isVisible as boolean) ?? true,
      opacity: 1,
      zIndex: (assoc.zIndex as number) ?? i,
      geoJsonData: geoData,
      sourceUrl: (layer.sourceUrl as string) || null,
      sourceType: (layer.sourceType as StudioLayer["sourceType"]) || "database",
      style: { ...baseStyle, ...((layer.styleConfig as Record<string, unknown>) || {}), ...savedStyle } as StudioLayer["style"],
      labels: savedLabels,
      popup: savedPopup,
      filter: savedFilter,
      featureCount: features.length,
      properties: props,
    };
  });

  const mapTags = (mapData.tags as { id: string }[]) || [];
  const mapRegions = (mapData.regions as { id: string }[]) || [];
  const mapThumbnail = mapData.thumbnail as { id: string; url: string } | null;
  const mapRefLinks = (mapData.referenceLinks as { title: string; url: string }[]) || [];

  return {
    datasetId: mapData.id as string,
    title: titleI18n.en || titleI18n.he || (mapData.title as string) || "",
    slug: (mapData.slug as string) || "",
    description: descI18n.en || descI18n.he || "",
    status: (mapData.status as string) || "draft",
    layers,
    selectedLayerId: null,
    center: (config.center as [number, number]) || [50.0, 24.0],
    zoom: (config.zoom as number) || 7,
    basemap: (config.basemap as string) || "carto-voyager",
    leftPanelOpen: true,
    rightPanelOpen: false,
    rightPanelMode: "style",
    isDirty: false,
    saving: false,
    year: (mapData.year as number) ?? null,
    yearMin: (mapData.yearMin as number) ?? null,
    yearMax: (mapData.yearMax as number) ?? null,
    period: (mapData.period as string) || "",
    version: (mapData.version as string) || "1.0.0",
    categoryId: (mapData.categoryId as string) || "",
    tagIds: mapTags.map((t) => t.id),
    regionIds: mapRegions.map((r) => r.id),
    thumbnailId: mapThumbnail?.id ?? null,
    thumbnailUrl: mapThumbnail?.url ?? null,
    referenceLinks: Array.isArray(mapRefLinks) ? mapRefLinks : [],
  };
}

export function MapStudio({ mapData, layerLibrary, isNew, categories, tags, regions }: MapStudioProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(dataStudioReducer, mapData, buildInitialState);

  const handleSave = useCallback(async () => {
    dispatch({ type: "SET_SAVING", saving: true });

    try {
      const layerAssociations = state.layers.map((l) => ({
        layerId: l.layerId,
        type: l.type,
        visible: l.visible,
        style: l.style,
        labels: l.labels,
        popup: l.popup,
        filter: l.filter,
        data: l.geoJsonData,
        sourceType: l.sourceType,
        url: l.sourceUrl || undefined,
      }));

      const basemap = BASEMAPS[state.basemap] || BASEMAPS["carto-voyager"];
      const tileConfig = {
        src: basemap.url,
        maxZoom: 19,
        subdomains: "abcd",
        attribution: basemap.attribution,
      };

      const mapPayload = {
        slug: state.slug || state.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        status: state.status,
        title: state.title,
        titleI18n: { en: state.title },
        description: state.description,
        descriptionI18n: { en: state.description },
        year: state.year,
        yearMin: state.yearMin,
        yearMax: state.yearMax,
        period: state.period || null,
        version: state.version || null,
        categoryId: state.categoryId || null,
        tagIds: state.tagIds,
        regionIds: state.regionIds,
        thumbnailId: state.thumbnailId,
        referenceLinks: state.referenceLinks.filter((l) => l.url),
        config: {
          tile: tileConfig,
          basemap: state.basemap,
          center: state.center,
          zoom: state.zoom,
          layers: layerAssociations,
        },
      };

      if (isNew || !state.datasetId) {
        const result = await createMap(mapPayload as unknown as MapInput);
        dispatch({ type: "MARK_CLEAN" });
        toast.success("Map created");
        router.push(`/admin/maps2/${result.id}`);
      } else {
        await updateMap(state.datasetId, mapPayload as unknown as MapInput);
        dispatch({ type: "MARK_CLEAN" });
        toast.success("Map saved");
      }
    } catch (err) {
      toast.error("Failed to save map");
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  }, [state, isNew, router]);

  const handleAddLayerFromLibrary = useCallback(
    async (layerId: string) => {
      try {
        const res = await fetch(`/api/geo/geojson/${layerId}`);
        let geoData: FeatureCollection | null = null;
        if (res.ok) {
          geoData = await res.json();
        }

        const libLayer = layerLibrary.find((l) => l.id === layerId);
        if (!libLayer) return;

        const isPoint = libLayer.type === "POINTS";
        const features = geoData?.features || [];
        const props = features.length > 0
          ? Object.keys((features[0].properties as Record<string, unknown>) || {})
          : [];

        const newLayer: StudioLayer = {
          id: `studio_${Date.now()}`,
          layerId: libLayer.id,
          name: libLayer.name,
          type: libLayer.type as StudioLayer["type"],
          visible: true,
          opacity: 1,
          zIndex: 0,
          geoJsonData: geoData,
          sourceUrl: null,
          sourceType: "database",
          style: isPoint ? { ...DEFAULT_POINT_STYLE } : { ...DEFAULT_POLYGON_STYLE },
          labels: null,
          popup: null,
          filter: null,
          featureCount: features.length,
          properties: props,
        };

        dispatch({ type: "ADD_LAYER", layer: newLayer });
      } catch {
        toast.error("Failed to load layer data");
      }
    },
    [layerLibrary]
  );

  const handleAddInlineLayer = useCallback(
    async (name: string, type: StudioLayer["type"], geoJson: FeatureCollection) => {
      try {
        const result = await createLayer({
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name,
          type,
          status: "draft",
          sourceType: "database",
          geoJsonData: geoJson as unknown as Record<string, unknown>,
        });

        const features = geoJson.features || [];
        const props = features.length > 0
          ? Object.keys((features[0].properties as Record<string, unknown>) || {})
          : [];
        const isPoint = type === "POINTS";

        const newLayer: StudioLayer = {
          id: `studio_${Date.now()}`,
          layerId: result.id,
          name,
          type,
          visible: true,
          opacity: 1,
          zIndex: 0,
          geoJsonData: geoJson,
          sourceUrl: null,
          sourceType: "database",
          style: isPoint ? { ...DEFAULT_POINT_STYLE } : { ...DEFAULT_POLYGON_STYLE },
          labels: null,
          popup: null,
          filter: null,
          featureCount: features.length,
          properties: props,
        };

        dispatch({ type: "ADD_LAYER", layer: newLayer });
        toast.success(`Layer "${name}" created`);
      } catch {
        toast.error("Failed to create layer");
      }
    },
    []
  );

  return (
    <DataStudioContext.Provider value={{ state, dispatch }}>
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <MapToolbar
          onSave={handleSave}
          onBack={() => router.push("/admin/maps2")}
        />

        <div className="flex flex-1 min-h-0">
          <LayerPanel
            layerLibrary={layerLibrary}
            onAddFromLibrary={handleAddLayerFromLibrary}
            onAddInline={handleAddInlineLayer}
          />

          <div className="flex-1 relative">
            <MapCanvas />
          </div>

          {state.rightPanelMode === "details" ? (
            <DetailsPanel categories={categories} tags={tags} regions={regions} />
          ) : (
            <StylePanel />
          )}
        </div>

        <StatusBar />
      </div>
    </DataStudioContext.Provider>
  );
}
