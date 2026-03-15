import { createContext, useContext } from "react";
import type { FeatureCollection } from "geojson";
import type {
  PolygonStyleConfig,
  PointStyleConfig,
  LabelConfig,
  PopupConfig,
  FilterConfig,
} from "@/types/map-config";

export interface StudioLayer {
  id: string;
  layerId: string;
  name: string;
  type: "POINTS" | "POLYGONS" | "POLYLINES" | "MULTI_POLYGONS" | "RASTER";
  visible: boolean;
  opacity: number;
  zIndex: number;
  geoJsonData: FeatureCollection | null;
  sourceUrl: string | null;
  sourceType: "url" | "database" | "inline";
  style: PolygonStyleConfig | PointStyleConfig;
  labels: LabelConfig | null;
  popup: PopupConfig | null;
  filter: FilterConfig | null;
  featureCount: number;
  properties: string[];
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface MapStudioState {
  mapId: string | null;
  title: string;
  slug: string;
  description: string;
  status: string;
  layers: StudioLayer[];
  selectedLayerId: string | null;
  center: [number, number];
  zoom: number;
  basemap: string;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelMode: "style" | "details";
  isDirty: boolean;
  saving: boolean;
  year: number | null;
  yearMin: number | null;
  yearMax: number | null;
  period: string;
  version: string;
  categoryId: string;
  tagIds: string[];
  regionIds: string[];
  thumbnailId: string | null;
  thumbnailUrl: string | null;
  referenceLinks: ReferenceLink[];
}

export type MapStudioAction =
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_SLUG"; slug: string }
  | { type: "SET_DESCRIPTION"; description: string }
  | { type: "SET_STATUS"; status: string }
  | { type: "SET_CENTER"; center: [number, number] }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "SET_BASEMAP"; basemap: string }
  | { type: "SELECT_LAYER"; layerId: string | null }
  | { type: "TOGGLE_LEFT_PANEL" }
  | { type: "TOGGLE_RIGHT_PANEL" }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "MARK_CLEAN" }
  | { type: "ADD_LAYER"; layer: StudioLayer }
  | { type: "REMOVE_LAYER"; layerId: string }
  | { type: "UPDATE_LAYER"; layerId: string; updates: Partial<StudioLayer> }
  | { type: "TOGGLE_LAYER_VISIBILITY"; layerId: string }
  | { type: "SET_LAYER_OPACITY"; layerId: string; opacity: number }
  | { type: "REORDER_LAYERS"; layerIds: string[] }
  | { type: "SET_LAYER_STYLE"; layerId: string; style: PolygonStyleConfig | PointStyleConfig }
  | { type: "SET_LAYER_LABELS"; layerId: string; labels: LabelConfig | null }
  | { type: "SET_LAYER_FILTER"; layerId: string; filter: FilterConfig | null }
  | { type: "SET_RIGHT_PANEL_MODE"; mode: "style" | "details" }
  | { type: "SET_YEAR"; year: number | null }
  | { type: "SET_YEAR_RANGE"; yearMin: number | null; yearMax: number | null }
  | { type: "SET_PERIOD"; period: string }
  | { type: "SET_VERSION"; version: string }
  | { type: "SET_CATEGORY"; categoryId: string }
  | { type: "SET_TAGS"; tagIds: string[] }
  | { type: "SET_REGIONS"; regionIds: string[] }
  | { type: "SET_THUMBNAIL"; thumbnailId: string | null; thumbnailUrl: string | null }
  | { type: "SET_REFERENCE_LINKS"; referenceLinks: ReferenceLink[] };

export function mapStudioReducer(
  state: MapStudioState,
  action: MapStudioAction
): MapStudioState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title, isDirty: true };
    case "SET_SLUG":
      return { ...state, slug: action.slug, isDirty: true };
    case "SET_DESCRIPTION":
      return { ...state, description: action.description, isDirty: true };
    case "SET_STATUS":
      return { ...state, status: action.status, isDirty: true };
    case "SET_CENTER":
      return { ...state, center: action.center };
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };
    case "SET_BASEMAP":
      return { ...state, basemap: action.basemap, isDirty: true };
    case "SELECT_LAYER":
      return {
        ...state,
        selectedLayerId: action.layerId,
        rightPanelOpen: action.layerId !== null,
        rightPanelMode: action.layerId !== null ? "style" : state.rightPanelMode,
      };
    case "TOGGLE_LEFT_PANEL":
      return { ...state, leftPanelOpen: !state.leftPanelOpen };
    case "TOGGLE_RIGHT_PANEL":
      return { ...state, rightPanelOpen: !state.rightPanelOpen };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "MARK_CLEAN":
      return { ...state, isDirty: false };
    case "ADD_LAYER": {
      const maxZ = state.layers.reduce((m, l) => Math.max(m, l.zIndex), 0);
      return {
        ...state,
        layers: [...state.layers, { ...action.layer, zIndex: maxZ + 1 }],
        selectedLayerId: action.layer.id,
        rightPanelOpen: true,
        isDirty: true,
      };
    }
    case "REMOVE_LAYER":
      return {
        ...state,
        layers: state.layers.filter((l) => l.id !== action.layerId),
        selectedLayerId:
          state.selectedLayerId === action.layerId
            ? null
            : state.selectedLayerId,
        isDirty: true,
      };
    case "UPDATE_LAYER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, ...action.updates } : l
        ),
        isDirty: true,
      };
    case "TOGGLE_LAYER_VISIBILITY":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, visible: !l.visible } : l
        ),
        isDirty: true,
      };
    case "SET_LAYER_OPACITY":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, opacity: action.opacity } : l
        ),
        isDirty: true,
      };
    case "REORDER_LAYERS": {
      const ordered = action.layerIds
        .map((id, i) => {
          const layer = state.layers.find((l) => l.id === id);
          return layer ? { ...layer, zIndex: i } : null;
        })
        .filter(Boolean) as StudioLayer[];
      return { ...state, layers: ordered, isDirty: true };
    }
    case "SET_LAYER_STYLE":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, style: action.style } : l
        ),
        isDirty: true,
      };
    case "SET_LAYER_LABELS":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, labels: action.labels } : l
        ),
        isDirty: true,
      };
    case "SET_LAYER_FILTER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, filter: action.filter } : l
        ),
        isDirty: true,
      };
    case "SET_RIGHT_PANEL_MODE":
      return {
        ...state,
        rightPanelMode: action.mode,
        rightPanelOpen: true,
        ...(action.mode === "details" && { selectedLayerId: null }),
      };
    case "SET_YEAR":
      return { ...state, year: action.year, isDirty: true };
    case "SET_YEAR_RANGE":
      return { ...state, yearMin: action.yearMin, yearMax: action.yearMax, isDirty: true };
    case "SET_PERIOD":
      return { ...state, period: action.period, isDirty: true };
    case "SET_VERSION":
      return { ...state, version: action.version, isDirty: true };
    case "SET_CATEGORY":
      return { ...state, categoryId: action.categoryId, isDirty: true };
    case "SET_TAGS":
      return { ...state, tagIds: action.tagIds, isDirty: true };
    case "SET_REGIONS":
      return { ...state, regionIds: action.regionIds, isDirty: true };
    case "SET_THUMBNAIL":
      return { ...state, thumbnailId: action.thumbnailId, thumbnailUrl: action.thumbnailUrl, isDirty: true };
    case "SET_REFERENCE_LINKS":
      return { ...state, referenceLinks: action.referenceLinks, isDirty: true };
    default:
      return state;
  }
}

export const MapStudioContext = createContext<{
  state: MapStudioState;
  dispatch: React.Dispatch<MapStudioAction>;
} | null>(null);

export function useMapStudio() {
  const ctx = useContext(MapStudioContext);
  if (!ctx) throw new Error("useMapStudio must be used within MapStudioProvider");
  return ctx;
}

export const BASEMAPS: Record<string, { name: string; url: string; attribution: string; dark?: boolean }> = {
  "carto-light": {
    name: "CARTO Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  "carto-dark": {
    name: "CARTO Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
    dark: true,
  },
  "carto-voyager": {
    name: "CARTO Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri',
  },
  "stamen-toner": {
    name: "Toner",
    url: "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png",
    attribution: '&copy; Stadia Maps &copy; Stamen Design',
  },
};

export const COLOR_PALETTES: { name: string; colors: string[] }[] = [
  { name: "Vintage", colors: ["#8B4513", "#CD853F", "#DEB887", "#D2691E", "#A0522D", "#F4A460", "#DAA520", "#BC8F8F"] },
  { name: "Ocean", colors: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"] },
  { name: "Jewel", colors: ["#6A0572", "#AB83A1", "#1B998B", "#2D3047", "#E55934", "#F0C808", "#086375", "#B80C09"] },
  { name: "Earth", colors: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#606C38", "#283618", "#DDA15E"] },
  { name: "Pastel", colors: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#E8BAFF", "#FFB3DE", "#B3FFE0"] },
  { name: "Bold", colors: ["#E63946", "#457B9D", "#1D3557", "#F1FAEE", "#A8DADC", "#2A9D8F", "#E9C46A", "#264653"] },
  { name: "Warm Sunset", colors: ["#FF6B6B", "#FFA07A", "#FFD93D", "#6BCB77", "#4D96FF", "#9B59B6", "#E74C3C", "#F39C12"] },
  { name: "Cool Forest", colors: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC"] },
  { name: "Monochrome", colors: ["#111111", "#333333", "#555555", "#777777", "#999999", "#BBBBBB", "#DDDDDD", "#F5F5F5"] },
  { name: "Hebrew Blue", colors: ["#003366", "#004488", "#0055AA", "#0066CC", "#3388DD", "#5599EE", "#88BBFF", "#BBDDFF"] },
];
