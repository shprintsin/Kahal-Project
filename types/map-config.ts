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
// NOTE: sibling definition of LabelConfigSchema in
// mapstudio/packages/shared/src/schemas/map-config.ts. Keep in sync manually
// until the type fork is unified via @kahal/shared.
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
  collision?: 'none' | 'hide';
  priorityField?: string;
  // Only render labels for features where `field` equals `value`. Independent
  // of include_list/exclude_list (which filter on the label field itself).
  filter?: {
    field: string;
    value: string | number | boolean;
  };
}

// Popup configuration
export interface PopupConfig {
  show: boolean;
  type: 'list' | 'template';
  fields?: string[];
  template?: string;
}

// Hover panel configuration
export interface HoverPanelConfig {
  fields?: string[];
  template?: string;
}

// Hover configuration
export interface HoverConfig {
  enable: boolean;
  display?: 'floating' | 'sidebar';
  style?: { fillOpacity?: number; weight?: number; color?: string };
  panel?: HoverPanelConfig;
}

// Legend configuration
export interface LegendConfig {
  position?: 'topright' | 'bottomright' | 'bottomleft' | 'topleft';
  layers?: string[];
  collapsed?: boolean;
}

// Control configuration
export interface ControlConfig {
  type: 'layer-toggle' | 'search';
  layers?: string[];
  layer?: string;
  field?: string;
}

// Behaviors configuration
export interface BehaviorsConfig {
  legend?: LegendConfig;
  controls?: ControlConfig[];
  url_state?: boolean;
}

// Style configurations
export interface GraduatedStyleConfig {
    field: string;
    method: 'equal_interval' | 'quantile' | 'custom';
    classes: number;
    colorRamp: { start: string; end: string };
    breaks: number[];
}

export interface GraduatedRadiusConfig {
  field: string;
  method?: 'sqrt' | 'log' | 'linear';
  minRadius?: number;
  maxRadius?: number;
}

export interface HighlightCondition {
  field: string;
  value: string | number | boolean;
}

export interface HighlightConfig {
  condition: HighlightCondition;
  color?: string;
  weight?: number;
  radiusBoost?: number;
  fillOpacity?: number;
}

// NOTE: sibling definition of PolygonStyleConfigSchema in
// mapstudio/packages/shared/src/schemas/map-config.ts. Keep in sync manually.
export interface PolygonStyleConfig {
  type: 'category' | 'simple' | 'graduated';
  field?: string;
  color_dict?: Record<string, string>;
  // Per-category stroke color/weight. When set alongside category styling,
  // stroke is looked up by `field` value; missing values fall back to
  // `color`/`weight`.
  stroke_color_dict?: Record<string, string>;
  stroke_weight_dict?: Record<string, number>;
  graduated?: GraduatedStyleConfig;
  default_color: string;
  opacity: number;
  weight: number;
  color: string; // border color
  highlight?: HighlightConfig;
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
  graduatedRadius?: GraduatedRadiusConfig;
  highlight?: HighlightConfig;
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
  zIndex?: number;
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
  behaviors?: BehaviorsConfig;
}

// Utility types
export type GeometryType = 'Point' | 'Polygon' | 'LineString' | 'MultiPoint' | 'MultiPolygon' | 'MultiLineString';

export interface GeoJSONInfo {
  type: GeometryType;
  featureCount: number;
  properties: string[];
  uniqueValues: Record<string, string[]>;
}
