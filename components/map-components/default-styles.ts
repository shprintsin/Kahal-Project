import { PolygonStyleConfig, PointStyleConfig, LabelConfig } from "../../app/admin/maps/types/config.types";

/**
 * DEFAULT_POLYGON_STYLE
 * 
 * Default styling configuration for polygon layers.
 * 
 * Polygon-specific properties:
 * - default_color: Fill color for the interior of polygons
 * - opacity: Transparency of the fill (0 = transparent, 1 = opaque)
 * - weight: Thickness of the border/outline in pixels
 * - color: Color of the border/outline
 * 
 * Note: Polygons do NOT have a radius property because their shape
 * is defined by their geometric coordinates (vertices).
 */
export const DEFAULT_POLYGON_STYLE: PolygonStyleConfig = {
  type: 'simple',
  default_color: '#3388ff', // Blue fill
  opacity: 0.2,              // 20% opacity for subtle fill
  weight: 2,                 // 2px border width
  color: '#3388ff'           // Blue border (matches fill)
};

/**
 * DEFAULT_POINT_STYLE
 * 
 * Default styling configuration for point/marker layers.
 * 
 * Point-specific properties:
 * - radius: Size of the circular marker in pixels (UNIQUE TO POINTS)
 * - fillColor: Interior color of the marker
 * - color: Stroke/outline color of the marker
 * - weight: Thickness of the stroke outline in pixels
 * - fillOpacity: Transparency of the fill (0 = transparent, 1 = opaque)
 * 
 * IMPORTANT: The radius property is REQUIRED for points and makes no sense
 * for polygons. Points are circular markers at specific coordinates,
 * while polygons are filled shapes with defined boundaries.
 */
export const DEFAULT_POINT_STYLE: PointStyleConfig = {
  type: 'simple',
  radius: 4,                 // 4px radius for marker size
  fillColor: '#ff7800',      // Orange fill
  color: '#000',             // Black stroke
  weight: 0.5,               // Thin 0.5px stroke
  fillOpacity: 0.8           // 80% opacity
};

/**
 * DEFAULT_LABEL_CONFIG
 * 
 * Default configuration for labels/tooltips on map features.
 * Labels are disabled by default and can be enabled per layer.
 */
export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  show: false,
  field: '',
  className: 'layer-label',
  position: 'center'
};
