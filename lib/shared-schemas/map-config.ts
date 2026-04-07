// Source of truth for map configuration schemas. Originally lived in
// mapstudio/packages/shared/src/schemas/map-config.ts and was duplicated here
// as part of the Phase 0 lift. The mapstudio sibling now mirrors this file
// one-way until that package is fully merged into the app.

import { z } from 'zod';
import {
  StyleTypeSchema,
  GraduatedMethodSchema,
  RadiusScaleSchema,
  LabelPositionSchema,
  LabelCollisionSchema,
  FontWeightSchema,
  PopupTypeSchema,
  SourceTypeSchema,
  BasemapKeySchema,
  RendererTypeSchema,
  HoverDisplaySchema,
  LegendPositionSchema,
  ControlTypeSchema,
} from './enums';

// --- Tile ---
export const TileConfigSchema = z.object({
  src: z.string(),
  maxZoom: z.number().default(19),
  subdomains: z.string().default('abc'),
  attribution: z.string().default(''),
});
export type TileConfig = z.infer<typeof TileConfigSchema>;

// --- Filter ---
export const FilterConfigSchema = z.object({
  field: z.string(),
  exclude: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
});
export type FilterConfig = z.infer<typeof FilterConfigSchema>;

// --- Label ---
export const LabelFilterConfigSchema = z.object({
  field: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type LabelFilterConfig = z.infer<typeof LabelFilterConfigSchema>;

export const LabelConfigSchema = z.object({
  show: z.boolean().default(false),
  field: z.string(),
  className: z.string().default('layer-label'),
  position: LabelPositionSchema.default('center'),
  include_list: z.array(z.string()).optional(),
  exclude_list: z.array(z.string()).optional(),
  fontSize: z.number().optional(),
  fontColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: FontWeightSchema.optional(),
  collision: LabelCollisionSchema.default('none'),
  priorityField: z.string().optional(),
  smart: z.boolean().optional(),
  // Limit label rendering to features where the named feature property equals `value`.
  // Independent of include_list/exclude_list (which filter on the label field itself).
  filter: LabelFilterConfigSchema.optional(),
});
export type LabelConfig = z.infer<typeof LabelConfigSchema>;

// --- Popup ---
export const PopupConfigSchema = z.object({
  show: z.boolean().default(true),
  type: PopupTypeSchema.default('list'),
  fields: z.array(z.string()).optional(),
  template: z.string().optional(),
});
export type PopupConfig = z.infer<typeof PopupConfigSchema>;

// --- Graduated Style ---
export const GraduatedStyleConfigSchema = z.object({
  field: z.string(),
  method: GraduatedMethodSchema.default('equal_interval'),
  classes: z.number().int().min(2).max(12).default(5),
  colorRamp: z.object({
    start: z.string(),
    end: z.string(),
  }),
  breaks: z.array(z.number()).default([]),
});
export type GraduatedStyleConfig = z.infer<typeof GraduatedStyleConfigSchema>;

// --- Graduated Radius ---
export const GraduatedRadiusConfigSchema = z.object({
  field: z.string(),
  method: RadiusScaleSchema.default('sqrt'),
  minRadius: z.number().default(2),
  maxRadius: z.number().default(20),
});
export type GraduatedRadiusConfig = z.infer<typeof GraduatedRadiusConfigSchema>;

// --- Highlight (conditional emphasis) ---
export const HighlightConditionSchema = z.object({
  field: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
export type HighlightCondition = z.infer<typeof HighlightConditionSchema>;

export const HighlightConfigSchema = z.object({
  condition: HighlightConditionSchema,
  color: z.string().optional(),
  weight: z.number().optional(),
  radiusBoost: z.number().optional(),
  fillOpacity: z.number().min(0).max(1).optional(),
});
export type HighlightConfig = z.infer<typeof HighlightConfigSchema>;

// --- Auto Radius (shortcut for graduated radius with zoom scaling) ---
export const AutoRadiusConfigSchema = z.object({
  field: z.string(),
  method: RadiusScaleSchema.default('sqrt'),
  range: z.tuple([z.number(), z.number()]).default([2, 18]),
});
export type AutoRadiusConfig = z.infer<typeof AutoRadiusConfigSchema>;

// --- Preset Name ---
export const PresetNameSchema = z.enum(['demographic', 'choropleth', 'simple-points', 'heatmap']);
export type PresetName = z.infer<typeof PresetNameSchema>;

// --- Preset Style Config ---
export const PresetStyleConfigSchema = z.object({
  preset: PresetNameSchema,
  category_field: z.string().optional(),
  size_field: z.string().optional(),
  color_field: z.string().optional(),
  label_field: z.string().optional(),
  palette: z.string().optional(),
});
export type PresetStyleConfig = z.infer<typeof PresetStyleConfigSchema>;

// --- Style: Polygon ---
export const PolygonStyleConfigSchema = z.object({
  type: StyleTypeSchema.default('simple'),
  field: z.string().optional(),
  color_dict: z.record(z.string(), z.string()).optional(),
  // Per-category stroke color/weight. When set alongside category styling, each
  // feature's stroke is looked up by `field` value; values not in the dict fall
  // back to `color`/`weight`.
  stroke_color_dict: z.record(z.string(), z.string()).optional(),
  stroke_weight_dict: z.record(z.string(), z.number()).optional(),
  graduated: GraduatedStyleConfigSchema.optional(),
  default_color: z.string().default('#3388ff'),
  opacity: z.number().min(0).max(1).default(0.2),
  weight: z.number().default(2),
  color: z.string().default('#3388ff'),
  highlight: HighlightConfigSchema.optional(),
  preset: PresetNameSchema.optional(),
});
export type PolygonStyleConfig = z.infer<typeof PolygonStyleConfigSchema>;

// --- Style: Point ---
export const PointStyleConfigSchema = z.object({
  type: StyleTypeSchema.default('simple'),
  field: z.string().optional(),
  color_dict: z.record(z.string(), z.string()).optional(),
  graduated: GraduatedStyleConfigSchema.optional(),
  radius: z.number().default(4),
  fillColor: z.string().default('#ff7800'),
  color: z.string().default('#000'),
  weight: z.number().default(0.5),
  fillOpacity: z.number().min(0).max(1).default(0.8),
  graduatedRadius: GraduatedRadiusConfigSchema.optional(),
  highlight: HighlightConfigSchema.optional(),
  auto_radius: AutoRadiusConfigSchema.optional(),
  preset: PresetNameSchema.optional(),
});
export type PointStyleConfig = z.infer<typeof PointStyleConfigSchema>;

// --- Hover Panel ---
export const HoverPanelConfigSchema = z.object({
  fields: z.array(z.string()).optional(),
  template: z.string().optional(),
});
export type HoverPanelConfig = z.infer<typeof HoverPanelConfigSchema>;

// --- Hover ---
export const HoverConfigSchema = z.object({
  enable: z.boolean().default(false),
  display: HoverDisplaySchema.optional(),
  style: z.object({
    fillOpacity: z.number().optional(),
    weight: z.number().optional(),
    color: z.string().optional(),
  }).optional(),
  panel: HoverPanelConfigSchema.optional(),
});
export type HoverConfig = z.infer<typeof HoverConfigSchema>;

// --- Layer Config (within map.yaml) ---
export const LayerConfigSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string(),
  type: z.enum(['polygon', 'point']),
  sourceType: SourceTypeSchema.optional(),
  data: z.any().optional(),
  url: z.string().optional(),
  visible: z.boolean().default(true),
  zIndex: z.number().optional(),
  filter: FilterConfigSchema.optional(),
  style: z.union([PolygonStyleConfigSchema, PointStyleConfigSchema]),
  labels: LabelConfigSchema.optional(),
  popup: PopupConfigSchema.optional(),
  hover: HoverConfigSchema.optional(),
  minZoom: z.number().optional(),
  maxZoom: z.number().optional(),
  feature_id: z.string().optional(),
});
export type LayerConfig = z.infer<typeof LayerConfigSchema>;

// --- Behaviors ---
export const LegendConfigSchema = z.object({
  position: LegendPositionSchema.default('bottomright'),
  layers: z.array(z.string()).optional(),
  collapsed: z.boolean().default(false),
});
export type LegendConfig = z.infer<typeof LegendConfigSchema>;

export const ControlConfigSchema = z.object({
  type: ControlTypeSchema,
  layers: z.array(z.string()).optional(),
  layer: z.string().optional(),
  field: z.string().optional(),
});
export type ControlConfig = z.infer<typeof ControlConfigSchema>;

export const BehaviorsSchema = z.object({
  legend: LegendConfigSchema.optional(),
  controls: z.array(ControlConfigSchema).optional(),
  url_state: z.boolean().default(false),
}).optional();
export type Behaviors = z.infer<typeof BehaviorsSchema>;

// --- Map Config (top-level map.yaml) ---
export const MapConfigSchema = z.object({
  schema: z.number().default(1),
  basemap: BasemapKeySchema.default('carto-light'),
  center: z.tuple([z.number(), z.number()]).default([52.0, 20.0]),
  zoom: z.number().default(6),
  layers: z.array(LayerConfigSchema).default([]),
  customCSS: z.string().optional(),
  behaviors: BehaviorsSchema,
  renderer: RendererTypeSchema.optional(),
  component: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
  tile: TileConfigSchema.optional(),
});
export type MapConfig = z.infer<typeof MapConfigSchema>;

// --- GeoJSON Info ---
export const GeoJSONInfoSchema = z.object({
  type: z.string(),
  featureCount: z.number(),
  properties: z.array(z.string()),
  uniqueValues: z.record(z.string(), z.array(z.string())),
});
export type GeoJSONInfo = z.infer<typeof GeoJSONInfoSchema>;

// --- Reference Link ---
export const ReferenceLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});
export type ReferenceLink = z.infer<typeof ReferenceLinkSchema>;

// --- Metadata (metadata.yaml) ---
export const MapMetadataSchema = z.object({
  title: z.record(z.string(), z.string()).default({ en: '' }),
  description: z.record(z.string(), z.string()).default({ en: '' }),
  year: z.number().optional(),
  yearMin: z.number().optional(),
  yearMax: z.number().optional(),
  period: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  maturity: z.string().default('Provisional'),
  license: z.string().default('CC-BY-4.0'),
  references: z.array(ReferenceLinkSchema).default([]),
});
export type MapMetadata = z.infer<typeof MapMetadataSchema>;

// --- Layer YAML (layer.yaml) ---
export const LayerFieldSchema = z.object({
  name: z.string(),
  type: z.enum(['string', 'number', 'boolean']),
  values: z.array(z.string()).optional(),
});
export type LayerField = z.infer<typeof LayerFieldSchema>;

export const LayerYamlSchema = z.object({
  name: z.string(),
  type: z.enum(['points', 'polygons', 'polylines']),
  description: z.string().default(''),
  year: z.number().optional(),
  fields: z.array(LayerFieldSchema).default([]),
  style: z.union([PolygonStyleConfigSchema, PointStyleConfigSchema]).optional(),
});
export type LayerYaml = z.infer<typeof LayerYamlSchema>;

// --- Workspace config (mapstudio.yaml) ---
export const MapstudioConfigSchema = z.object({
  apiUrl: z.string().default('http://localhost:3000'),
  apiKey: z.string().optional(),
  defaults: z.object({
    basemap: BasemapKeySchema.default('carto-light'),
    palette: z.string().default('Vintage'),
  }).default({}),
});
export type MapstudioConfig = z.infer<typeof MapstudioConfigSchema>;
