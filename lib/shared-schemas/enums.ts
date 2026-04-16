// Source of truth for shared enum schemas. Originally lived in
// mapstudio/packages/shared/src/schemas/enums.ts and was duplicated here as
// part of the Phase 0 lift. The mapstudio sibling now mirrors this file
// one-way until that package is fully merged into the app.

import { z } from 'zod';

export const ContentStatusSchema = z.enum([
  'draft',
  'published',
  'archived',
]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const LayerTypeSchema = z.enum([
  'POINTS',
  'POLYGONS',
  'POLYLINES',
  'MULTI_POLYGONS',
  'RASTER',
]);
export type LayerType = z.infer<typeof LayerTypeSchema>;

export const GeometryTypeSchema = z.enum([
  'Point',
  'Polygon',
  'LineString',
  'MultiPoint',
  'MultiPolygon',
  'MultiLineString',
]);
export type GeometryType = z.infer<typeof GeometryTypeSchema>;

export const SourceTypeSchema = z.enum(['url', 'database', 'inline']);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const MapSourceSchema = z.enum(['mapstudio', 'web']).nullable().optional();
export type MapSource = z.infer<typeof MapSourceSchema>;

export const BasemapKeySchema = z.enum([
  'carto-light',
  'carto-dark',
  'carto-voyager',
  'osm',
  'satellite',
  'stamen-toner',
  'carto-positron',
  'carto-dark-matter',
  'carto-voyager-gl',
  'osm-liberty',
  'osm-bright',
  'osm-positron',
]);
export type BasemapKey = z.infer<typeof BasemapKeySchema>;

export const LabelPositionSchema = z.enum(['center', 'top', 'bottom', 'left', 'right']);
export type LabelPosition = z.infer<typeof LabelPositionSchema>;

export const FontWeightSchema = z.enum(['normal', 'bold', '400', '500', '600', '700']);
export type FontWeight = z.infer<typeof FontWeightSchema>;

export const PopupTypeSchema = z.enum(['list', 'template']);
export type PopupType = z.infer<typeof PopupTypeSchema>;

export const StyleTypeSchema = z.enum(['simple', 'category', 'graduated']);
export type StyleType = z.infer<typeof StyleTypeSchema>;

export const GraduatedMethodSchema = z.enum(['equal_interval', 'quantile', 'custom']);
export type GraduatedMethod = z.infer<typeof GraduatedMethodSchema>;

export const RadiusScaleSchema = z.enum(['sqrt', 'log', 'linear', 'stepped']);
export type RadiusScale = z.infer<typeof RadiusScaleSchema>;

export const LabelCollisionSchema = z.enum(['none', 'hide']);
export type LabelCollision = z.infer<typeof LabelCollisionSchema>;

export const RendererTypeSchema = z.enum(['standard', 'custom']).default('standard');
export type RendererType = z.infer<typeof RendererTypeSchema>;

export const HoverDisplaySchema = z.enum(['floating', 'sidebar']).default('floating');
export type HoverDisplay = z.infer<typeof HoverDisplaySchema>;

export const LegendPositionSchema = z.enum(['topright', 'bottomright', 'bottomleft', 'topleft']);
export type LegendPosition = z.infer<typeof LegendPositionSchema>;

export const ControlTypeSchema = z.enum(['layer-toggle', 'search']);
export type ControlType = z.infer<typeof ControlTypeSchema>;

export const MaturitySchema = z.enum(['Provisional', 'Verified', 'Authoritative']);
export type Maturity = z.infer<typeof MaturitySchema>;

export const DataMaturitySchema = z.enum(['Raw', 'Preliminary', 'Provisional', 'Validated']);
export type DataMaturity = z.infer<typeof DataMaturitySchema>;

export const ResourceTypeSchema = z.enum([
  'XLSX', 'CSV', 'JSON', 'PDF', 'HTML', 'DOCX', 'ZIP', 'TXT', 'XLS',
  'PNG', 'JPG', 'TIFF', 'URL', 'UNKNOWN',
]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
