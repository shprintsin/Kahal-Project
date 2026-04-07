import type { FeatureCollection, Feature } from 'geojson';
import type {
  MapConfig,
  LayerConfig,
  PolygonStyleConfig,
  PointStyleConfig,
  GraduatedStyleConfig,
  FilterConfig,
  LabelConfig,
  HoverConfig,
  HighlightConfig,
} from '@/types/map-config';

// ─── Types ─────────────────────────────────────

export type MLExpression = string | number | boolean | null | MLExpression[];

export interface CompiledLayer {
  id: string;
  type: 'fill' | 'line' | 'circle' | 'symbol';
  paint: Record<string, MLExpression | string | number>;
  layout: Record<string, MLExpression | string | number | boolean>;
  filter?: MLExpression;
  minzoom?: number;
  maxzoom?: number;
}

export interface LayerSpec {
  sourceId: string;
  sourceData: string | FeatureCollection;
  layers: CompiledLayer[];
  layerName: string;
  visible: boolean;
}

export interface CompiledMapConfig {
  mapStyle: string;
  center: [number, number];
  zoom: number;
  layerSpecs: LayerSpec[];
  attribution: string;
}

// ─── Basemap Resolution ─────────────────────────

const GL_STYLES: Record<string, string> = {
  'carto-positron': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  'carto-dark-matter': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'carto-voyager-gl': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'carto-light': 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  'carto-dark': 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  'carto-voyager': 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  'osm': 'https://tiles.openfreemap.org/styles/liberty',
  'osm-liberty': 'https://tiles.openfreemap.org/styles/liberty',
};

const DEFAULT_GL_STYLE = GL_STYLES['carto-light'];

function resolveGlStyle(basemapKey?: string): string {
  if (!basemapKey) return DEFAULT_GL_STYLE;
  return GL_STYLES[basemapKey] ?? DEFAULT_GL_STYLE;
}

// ─── Color / Expression Compilation ─────────────

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Compile fill-color expression for polygon layers.
 * category -> match expression
 * graduated -> interpolate expression
 * simple -> literal color
 */
export function compileFillColor(style: PolygonStyleConfig): MLExpression {
  if (style.type === 'category' && style.field && style.color_dict) {
    const pairs: MLExpression[] = [];
    for (const [value, color] of Object.entries(style.color_dict)) {
      pairs.push(value, color);
    }
    if (pairs.length === 0) return style.default_color;
    return ['match', ['get', style.field], ...pairs, style.default_color];
  }

  if (style.type === 'graduated' && style.graduated) {
    return compileGraduatedColorExpression(style.graduated, style.default_color);
  }

  return style.default_color;
}

/**
 * Compile line-color expression for polygon strokes.
 * When category styling + stroke_color_dict is provided, returns a
 * MapLibre match expression keyed on style.field. Otherwise falls back
 * to the uniform style.color.
 */
export function compileStrokeLineColor(style: PolygonStyleConfig): MLExpression {
  if (
    style.type === 'category' &&
    style.field &&
    style.stroke_color_dict &&
    Object.keys(style.stroke_color_dict).length > 0
  ) {
    const pairs: MLExpression[] = [];
    for (const [value, color] of Object.entries(style.stroke_color_dict)) {
      pairs.push(value, color);
    }
    return ['match', ['get', style.field], ...pairs, style.color ?? 'white'];
  }
  return style.color ?? 'white';
}

/**
 * Compile line-width expression for polygon strokes.
 * When category styling + stroke_weight_dict is provided, returns a
 * MapLibre match expression keyed on style.field. Otherwise falls back
 * to the uniform style.weight.
 */
export function compileStrokeLineWidth(style: PolygonStyleConfig): MLExpression {
  if (
    style.type === 'category' &&
    style.field &&
    style.stroke_weight_dict &&
    Object.keys(style.stroke_weight_dict).length > 0
  ) {
    const pairs: MLExpression[] = [];
    for (const [value, weight] of Object.entries(style.stroke_weight_dict)) {
      pairs.push(value, weight);
    }
    return ['match', ['get', style.field], ...pairs, style.weight ?? 1];
  }
  return style.weight ?? 1;
}

/**
 * Compile circle-color expression for point layers.
 * Same logic as polygon but uses fillColor.
 */
export function compileCircleColor(style: PointStyleConfig): MLExpression {
  if (style.type === 'category' && style.field && style.color_dict) {
    const pairs: MLExpression[] = [];
    for (const [value, color] of Object.entries(style.color_dict)) {
      pairs.push(value, color);
    }
    if (pairs.length === 0) return style.fillColor;
    return ['match', ['get', style.field], ...pairs, style.fillColor];
  }

  if (style.type === 'graduated' && style.graduated) {
    return compileGraduatedColorExpression(style.graduated, style.fillColor);
  }

  return style.fillColor;
}

function compileGraduatedColorExpression(
  grad: GraduatedStyleConfig,
  fallback: string,
): MLExpression {
  if (!grad.breaks || grad.breaks.length === 0) return fallback;

  const { colorRamp, breaks } = grad;
  const totalBins = breaks.length + 1;
  const stops: MLExpression[] = [];

  for (let i = 0; i < totalBins; i++) {
    const ratio = totalBins === 1 ? 0 : i / (totalBins - 1);
    const color = interpolateColorHex(colorRamp.start, colorRamp.end, ratio);
    // For the first stop, use the first break value; for the last, use last break
    const breakValue = i === 0
      ? breaks[0]
      : i >= breaks.length
        ? breaks[breaks.length - 1]
        : breaks[i];
    stops.push(breakValue, color);
  }

  // Deduplicate: interpolate requires strictly increasing stops
  const dedupedStops: MLExpression[] = [];
  let lastBreak = -Infinity;
  for (let i = 0; i < stops.length; i += 2) {
    const bv = stops[i] as number;
    if (bv > lastBreak) {
      dedupedStops.push(bv, stops[i + 1]);
      lastBreak = bv;
    }
  }

  if (dedupedStops.length < 4) {
    // Need at least 2 stops for interpolation
    return fallback;
  }

  return [
    'interpolate',
    ['linear'],
    ['get', grad.field],
    ...dedupedStops,
  ];
}

function interpolateColorHex(start: string, end: string, ratio: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(start);
  const [r2, g2, b2] = parse(end);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return '#' + [r, g, b].map((v) => ('00' + v.toString(16)).slice(-2)).join('');
}

// ─── Circle Radius ──────────────────────────────

/**
 * Compile circle-radius expression.
 * If graduatedRadius exists, compute zoom-scaled interpolation from data range.
 * Otherwise return literal radius.
 */
export function compileCircleRadius(
  style: PointStyleConfig,
  geoData?: FeatureCollection,
): MLExpression {
  if (!style.graduatedRadius) {
    return style.radius || 6;
  }

  const { field, method = 'sqrt', minRadius = 2, maxRadius = 20 } = style.graduatedRadius;

  // Compute data range from geoData
  let dataMin = 0;
  let dataMax = 1;

  if (geoData?.features) {
    const values: number[] = [];
    for (const feature of geoData.features) {
      const raw = Number(feature.properties?.[field]);
      if (!isNaN(raw) && raw > 0) {
        values.push(raw);
      }
    }
    if (values.length > 0) {
      dataMin = Math.min(...values);
      dataMax = Math.max(...values);
    }
  }

  if (dataMax <= dataMin) return minRadius;

  // For MapLibre, we build an interpolation expression
  // For sqrt/log, we need to use maplibre expressions
  if (method === 'sqrt') {
    return [
      'interpolate',
      ['linear'],
      ['sqrt', ['max', ['-', ['get', field], dataMin], 0]],
      0, minRadius,
      Math.sqrt(dataMax - dataMin), maxRadius,
    ];
  }

  if (method === 'log') {
    return [
      'interpolate',
      ['linear'],
      ['ln', ['+', ['max', ['-', ['get', field], dataMin], 0], 1]],
      0, minRadius,
      Math.log(dataMax - dataMin + 1), maxRadius,
    ];
  }

  // linear
  return [
    'interpolate',
    ['linear'],
    ['get', field],
    dataMin, minRadius,
    dataMax, maxRadius,
  ];
}

// ─── Filter Compilation ─────────────────────────

export function compileFilter(filter: FilterConfig): MLExpression | undefined {
  if (!filter.field) return undefined;

  if (filter.include && filter.include.length > 0) {
    return ['in', ['get', filter.field], ['literal', filter.include]];
  }

  if (filter.exclude && filter.exclude.length > 0) {
    return ['!', ['in', ['get', filter.field], ['literal', filter.exclude]]];
  }

  return undefined;
}

// ─── Symbol / Label Layer ───────────────────────

export function compileSymbolLayer(
  labels: LabelConfig,
  layerId: string,
): CompiledLayer {
  const layout: Record<string, MLExpression | string | number | boolean> = {
    'text-field': ['get', labels.field],
    'text-size': [
      'interpolate', ['linear'], ['zoom'],
      4, Math.max((labels.fontSize ?? 14) - 4, 8),
      8, labels.fontSize ?? 14,
      14, (labels.fontSize ?? 14) + 4,
    ],
    'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
    'text-anchor': labels.position === 'top' ? 'bottom'
      : labels.position === 'bottom' ? 'top'
        : labels.position === 'left' ? 'right'
          : labels.position === 'right' ? 'left'
            : 'center',
    'text-allow-overlap': labels.collision !== 'hide',
    'text-optional': true,
    'text-padding': labels.collision === 'hide' ? 8 : 2,
    'visibility': 'visible',
  };

  // Priority sort: higher-priority labels render first (get placement priority)
  if (labels.priorityField) {
    layout['symbol-sort-key'] = ['-', 0, ['to-number', ['get', labels.priorityField], 0]];
  }

  const paint: Record<string, MLExpression | string | number> = {
    'text-color': labels.fontColor ?? '#000000',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1.5,
    'text-halo-blur': 0.5,
  };

  // Build filter from (include_list | exclude_list) combined with an optional
  // feature-field filter. When both are present they are AND-ed with 'all'.
  const clauses: MLExpression[] = [];
  if (labels.include_list && labels.include_list.length > 0) {
    clauses.push(['in', ['get', labels.field], ['literal', labels.include_list]]);
  } else if (labels.exclude_list && labels.exclude_list.length > 0) {
    clauses.push(['!', ['in', ['get', labels.field], ['literal', labels.exclude_list]]]);
  }
  if (labels.filter) {
    clauses.push([
      '==',
      ['get', labels.filter.field],
      labels.filter.value as MLExpression,
    ]);
  }
  const filter: MLExpression | undefined =
    clauses.length === 0 ? undefined :
    clauses.length === 1 ? clauses[0] :
    ['all', ...clauses];

  return {
    id: `${layerId}-labels`,
    type: 'symbol',
    paint,
    layout,
    ...(filter ? { filter } : {}),
  };
}

// ─── Highlight / Hover expressions ──────────────

function compileHoverPaint(
  baseOpacity: number,
  hover?: HoverConfig,
): Record<string, MLExpression | string | number> {
  const hoverOpacity = hover?.style?.fillOpacity ?? Math.min(1, baseOpacity + 0.2);
  return {
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverOpacity,
      baseOpacity,
    ],
  };
}

function compileHoverLinePaint(
  baseWeight: number,
  baseColor: string,
  hover?: HoverConfig,
): Record<string, MLExpression | string | number> {
  const hoverWeight = hover?.style?.weight ?? baseWeight + 1;
  const hoverColor = hover?.style?.color ?? baseColor;
  return {
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverWeight,
      baseWeight,
    ],
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverColor,
      baseColor,
    ],
  };
}

function compileCircleHoverPaint(
  baseOpacity: number,
  baseStrokeWidth: number,
  hover?: HoverConfig,
): Record<string, MLExpression | string | number> {
  const hoverOpacity = hover?.style?.fillOpacity ?? Math.min(1, baseOpacity + 0.2);
  const hoverStroke = hover?.style?.weight ?? baseStrokeWidth + 1;
  return {
    'circle-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverOpacity,
      baseOpacity,
    ],
    'circle-stroke-width': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      hoverStroke,
      baseStrokeWidth,
    ],
  };
}

// ─── Highlight expression overlay ───────────────

function compileHighlightFillColor(
  baseExpression: MLExpression,
  highlight: HighlightConfig,
): MLExpression {
  if (!highlight.color) return baseExpression;
  const condition: MLExpression = [
    '==',
    ['get', highlight.condition.field],
    highlight.condition.value as MLExpression,
  ];
  return ['case', condition, highlight.color, baseExpression];
}

function compileHighlightLineWeight(
  baseWeight: MLExpression,
  highlight: HighlightConfig,
): MLExpression {
  if (highlight.weight == null) return baseWeight;
  const condition: MLExpression = [
    '==',
    ['get', highlight.condition.field],
    highlight.condition.value as MLExpression,
  ];
  return ['case', condition, highlight.weight, baseWeight];
}

function compileHighlightFillOpacity(
  baseOpacity: MLExpression,
  highlight: HighlightConfig,
): MLExpression {
  if (highlight.fillOpacity == null) return baseOpacity;
  const condition: MLExpression = [
    '==',
    ['get', highlight.condition.field],
    highlight.condition.value as MLExpression,
  ];
  return ['case', condition, highlight.fillOpacity, baseOpacity];
}

// ─── Layer Compilation ──────────────────────────

function compilePolygonLayers(
  layerConfig: LayerConfig,
  layerId: string,
  geoData?: FeatureCollection,
): CompiledLayer[] {
  const style = layerConfig.style as PolygonStyleConfig;
  const layers: CompiledLayer[] = [];

  let fillColor = compileFillColor(style);
  let fillOpacity: MLExpression = style.opacity ?? 0.6;
  let lineColor: MLExpression = compileStrokeLineColor(style);
  let lineWeight: MLExpression = compileStrokeLineWidth(style);

  // Apply highlight overrides. Highlight wraps the existing expression in a
  // case-when, so category stroke dict + highlight compose correctly.
  if (style.highlight) {
    fillColor = compileHighlightFillColor(fillColor, style.highlight);
    lineWeight = compileHighlightLineWeight(lineWeight, style.highlight);
    fillOpacity = compileHighlightFillOpacity(style.opacity ?? 0.6, style.highlight);
    if (style.highlight.color) {
      lineColor = compileHighlightFillColor(lineColor, style.highlight);
    }
  }

  // Fill layer
  const fillPaint: Record<string, MLExpression | string | number> = {
    'fill-color': fillColor,
    'fill-opacity': fillOpacity,
  };

  // Overlay hover feature-state expressions
  if (layerConfig.hover?.enable) {
    const hoverPaint = compileHoverPaint(
      typeof fillOpacity === 'number' ? fillOpacity : 0.6,
      layerConfig.hover,
    );
    Object.assign(fillPaint, hoverPaint);
  }

  const compiledFilter = layerConfig.filter ? compileFilter(layerConfig.filter) : undefined;

  layers.push({
    id: `${layerId}-fill`,
    type: 'fill',
    paint: fillPaint,
    layout: { visibility: layerConfig.visible ? 'visible' : 'none' },
    ...(compiledFilter ? { filter: compiledFilter } : {}),
    ...(layerConfig.minZoom != null ? { minzoom: layerConfig.minZoom } : {}),
    ...(layerConfig.maxZoom != null ? { maxzoom: layerConfig.maxZoom } : {}),
  });

  // Line (border) layer
  const linePaint: Record<string, MLExpression | string | number> = {
    'line-color': lineColor,
    'line-width': lineWeight,
  };

  if (layerConfig.hover?.enable) {
    const hoverLinePaint = compileHoverLinePaint(
      typeof lineWeight === 'number' ? lineWeight : 1,
      typeof lineColor === 'string' ? lineColor : 'white',
      layerConfig.hover,
    );
    Object.assign(linePaint, hoverLinePaint);
  }

  layers.push({
    id: `${layerId}-line`,
    type: 'line',
    paint: linePaint,
    layout: { visibility: layerConfig.visible ? 'visible' : 'none' },
    ...(compiledFilter ? { filter: compiledFilter } : {}),
    ...(layerConfig.minZoom != null ? { minzoom: layerConfig.minZoom } : {}),
    ...(layerConfig.maxZoom != null ? { maxzoom: layerConfig.maxZoom } : {}),
  });

  // Label layer
  if (layerConfig.labels?.show) {
    layers.push(compileSymbolLayer(layerConfig.labels, layerId));
  }

  return layers;
}

function compilePointLayers(
  layerConfig: LayerConfig,
  layerId: string,
  geoData?: FeatureCollection,
): CompiledLayer[] {
  const style = layerConfig.style as PointStyleConfig;
  const layers: CompiledLayer[] = [];

  const circleColor = compileCircleColor(style);
  const circleRadius = compileCircleRadius(style, geoData);
  const compiledFilter = layerConfig.filter ? compileFilter(layerConfig.filter) : undefined;

  const circlePaint: Record<string, MLExpression | string | number> = {
    'circle-color': circleColor,
    'circle-radius': circleRadius,
    'circle-stroke-color': style.color ?? '#000',
    'circle-stroke-width': style.weight ?? 1,
    'circle-opacity': style.fillOpacity ?? 0.8,
  };

  // Hover feature-state
  if (layerConfig.hover?.enable) {
    const hoverPaint = compileCircleHoverPaint(
      style.fillOpacity ?? 0.8,
      style.weight ?? 1,
      layerConfig.hover,
    );
    Object.assign(circlePaint, hoverPaint);
  }

  // Highlight overrides
  if (style.highlight) {
    if (style.highlight.radiusBoost != null) {
      const condition: MLExpression = [
        '==',
        ['get', style.highlight.condition.field],
        style.highlight.condition.value as MLExpression,
      ];
      const baseRadius = typeof circleRadius === 'number' ? circleRadius : 6;
      circlePaint['circle-radius'] = [
        'case', condition, baseRadius + style.highlight.radiusBoost, circleRadius,
      ];
    }
    if (style.highlight.color) {
      circlePaint['circle-stroke-color'] = compileHighlightFillColor(
        style.color ?? '#000',
        style.highlight,
      );
    }
    if (style.highlight.fillOpacity != null) {
      circlePaint['circle-opacity'] = compileHighlightFillOpacity(
        style.fillOpacity ?? 0.8,
        style.highlight,
      );
    }
  }

  layers.push({
    id: `${layerId}-circle`,
    type: 'circle',
    paint: circlePaint,
    layout: { visibility: layerConfig.visible ? 'visible' : 'none' },
    ...(compiledFilter ? { filter: compiledFilter } : {}),
    ...(layerConfig.minZoom != null ? { minzoom: layerConfig.minZoom } : {}),
    ...(layerConfig.maxZoom != null ? { maxzoom: layerConfig.maxZoom } : {}),
  });

  // Label layer
  if (layerConfig.labels?.show) {
    layers.push(compileSymbolLayer(layerConfig.labels, layerId));
  }

  return layers;
}

// ─── GeoJSON Source Resolution ──────────────────

function resolveSourceUrl(layerConfig: LayerConfig): string | null {
  if (layerConfig.sourceType === 'database' && layerConfig.id) {
    const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || '';
    return `${apiUrl}/api/geo/geojson/${layerConfig.id}`;
  }
  return layerConfig.url ?? null;
}

// ─── Main Compiler ──────────────────────────────

export function compileMapConfig(
  config: MapConfig,
  layerDataMap?: Map<string, FeatureCollection>,
): CompiledMapConfig {
  const mapStyle = resolveGlStyle(
    // config.tile is the Leaflet tile config — resolve basemap from its shape
    (config as MapConfig & { basemap?: string }).basemap ?? guessBasemapKey(config.tile.src),
  );

  const layerSpecs: LayerSpec[] = [];

  for (const layerConfig of config.layers) {
    const layerKey = layerConfig.id || layerConfig.name;
    const geoData = layerDataMap?.get(layerKey) ?? layerConfig.data ?? undefined;

    // Determine source: inline data or URL
    let sourceData: string | FeatureCollection;
    if (geoData) {
      sourceData = geoData;
    } else {
      const url = resolveSourceUrl(layerConfig);
      if (!url) continue;
      sourceData = url;
    }

    const sourceId = `source-${layerKey}`;

    const compiledLayers = layerConfig.type === 'polygon'
      ? compilePolygonLayers(layerConfig, layerKey, geoData ?? undefined)
      : compilePointLayers(layerConfig, layerKey, geoData ?? undefined);

    layerSpecs.push({
      sourceId,
      sourceData,
      layers: compiledLayers,
      layerName: layerConfig.name,
      visible: layerConfig.visible,
    });
  }

  return {
    mapStyle,
    center: config.center,
    zoom: config.zoom,
    layerSpecs,
    attribution: '<a href="/copyright" target="_blank">&copy; ShtetlAtlas</a> | &copy; <a href="https://carto.com">CARTO</a>',
  };
}

/**
 * Guess the basemap key from a raster tile URL so we can pick the right GL style.
 */
function guessBasemapKey(tileUrl: string): string {
  if (tileUrl.includes('dark_all') || tileUrl.includes('dark-matter')) return 'carto-dark';
  if (tileUrl.includes('voyager')) return 'carto-voyager';
  if (tileUrl.includes('light_all') || tileUrl.includes('positron')) return 'carto-light';
  if (tileUrl.includes('openstreetmap.org')) return 'osm';
  return 'carto-light';
}
