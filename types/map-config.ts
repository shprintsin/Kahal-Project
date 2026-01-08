import type { FeatureCollection } from 'geojson';

// Tile configuration
export interface TileConfig {
  src: string;
  maxZoom: number;
  subdomains: string;
  attribution: string;
}

// Filter configuration
export interface FilterConfig {
  field: string;
  exclude?: string[];
  include?: string[];
}

// Label configuration
export interface LabelConfig {
  show: boolean;
  field: string;
  className: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  include_list?: string[];
  exclude_list?: string[];
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | '400' | '500' | '600' | '700';
}

// Popup configuration
export interface PopupConfig {
  show: boolean;
  type: 'list' | 'template';
  fields?: string[];
  template?: string;
}

// Hover configuration
export interface HoverConfig {
  enable: boolean;
  style?: PolygonStyleConfig | PointStyleConfig;
}

// Style configurations
export interface GraduatedStyleConfig {
    field: string;
    method: 'equal_interval' | 'quantile' | 'custom';
    classes: number;
    colorRamp: { start: string; end: string };
    breaks: number[];
}

export interface PolygonStyleConfig {
  type: 'category' | 'simple' | 'graduated';
  field?: string;
  color_dict?: Record<string, string>;
  graduated?: GraduatedStyleConfig;
  default_color: string;
  opacity: number;
  weight: number;
  color: string; // border color
}

export interface PointStyleConfig {
  type: 'category' | 'simple' | 'graduated';
  field?: string;
  color_dict?: Record<string, string>;
  graduated?: GraduatedStyleConfig;
  radius: number;
  fillColor: string;
  color: string; // stroke color
  weight: number;
  fillOpacity: number;
}

// Layer configuration
export interface LayerConfig {
  id: string;
  name: string;
  type: 'polygon' | 'point';
  sourceType?: 'url' | 'database' | 'inline'; // Add sourceType
  data?: FeatureCollection | null;
  url?: string;
  visible: boolean;
  filter?: FilterConfig;
  style: PolygonStyleConfig | PointStyleConfig;
  labels?: LabelConfig;
  popup?: PopupConfig;
  hover?: HoverConfig;
  minZoom?: number;
  maxZoom?: number;
  feature_id?: string;
}

// Main map configuration
export interface MapConfig {
  tile: TileConfig;
  zoom: number;
  center: [number, number];
  layers: LayerConfig[];
  customCSS?: string;
}

// Utility types
export type GeometryType = 'Point' | 'Polygon' | 'LineString' | 'MultiPoint' | 'MultiPolygon' | 'MultiLineString';

export interface GeoJSONInfo {
  type: GeometryType;
  featureCount: number;
  properties: string[];
  uniqueValues: Record<string, string[]>;
}
