import type { MapConfig, LayerConfig, PolygonStyleConfig, PointStyleConfig, GraduatedStyleConfig, HighlightConfig } from '../types/map-config';

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export function interpolateColor(startHex: string, endHex: string, ratio: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(startHex);
  const [r2, g2, b2] = parse(endHex);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return '#' + [r, g, b].map((v) => ('00' + v.toString(16)).slice(-2)).join('');
}

// ---------------------------------------------------------------------------
// Graduated color utilities
// ---------------------------------------------------------------------------

export function equalIntervalBreaks(values: number[], classes: number): number[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / classes;
  const breaks: number[] = [];
  for (let i = 1; i < classes; i++) {
    breaks.push(min + step * i);
  }
  return breaks;
}

export function quantileBreaks(values: number[], classes: number): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const breaks: number[] = [];
  for (let i = 1; i < classes; i++) {
    const idx = Math.floor((i / classes) * sorted.length);
    breaks.push(sorted[idx]);
  }
  return breaks;
}

export function getBinIndex(value: number, breaks: number[]): number {
  for (let i = 0; i < breaks.length; i++) {
    if (value < breaks[i]) return i;
  }
  return breaks.length;
}

export function getGraduatedColor(value: number, config: GraduatedStyleConfig): string {
  const { breaks, colorRamp } = config;
  if (breaks.length === 0) return colorRamp.start;
  const bin = getBinIndex(value, breaks);
  const ratio = bin / breaks.length;
  return interpolateColor(colorRamp.start, colorRamp.end, ratio);
}

// ---------------------------------------------------------------------------
// Graduated radius + highlight utilities
// ---------------------------------------------------------------------------

export function resolveFeatureRadius(
  properties: Record<string, unknown>,
  style: PointStyleConfig,
  dataRange?: { min: number; max: number },
): number {
  if (!style.graduatedRadius) return style.radius || 4;
  const raw = Number(properties[style.graduatedRadius.field]);
  if (isNaN(raw) || raw <= 0) return style.graduatedRadius.minRadius ?? 2;
  const { method = 'sqrt', minRadius = 2, maxRadius = 20 } = style.graduatedRadius;
  const min = dataRange?.min ?? 0;
  const max = dataRange?.max ?? raw;
  if (max <= min) return minRadius;
  let ratio: number;
  switch (method) {
    case 'sqrt': ratio = Math.sqrt((raw - min) / (max - min)); break;
    case 'log': ratio = Math.log1p(raw - min) / Math.log1p(max - min); break;
    default: ratio = (raw - min) / (max - min);
  }
  return minRadius + ratio * (maxRadius - minRadius);
}

export function matchesHighlight(
  properties: Record<string, unknown>,
  highlight?: HighlightConfig,
): boolean {
  if (!highlight) return false;
  return String(properties[highlight.condition.field]) === String(highlight.condition.value);
}

// ---------------------------------------------------------------------------
// Style resolver (supports simple, category, graduated for both polygon+point)
// ---------------------------------------------------------------------------

export function getStyle(feature: any, layerConfig: LayerConfig, dataRange?: { min: number; max: number }): Record<string, unknown> {
  if (layerConfig.type === 'polygon') {
    const styleConf = layerConfig.style as PolygonStyleConfig;
    let fillColor = styleConf.default_color;

    if (styleConf.type === 'category' && styleConf.field) {
      const val = feature.properties[styleConf.field];
      if (styleConf.color_dict && styleConf.color_dict[val]) {
        fillColor = styleConf.color_dict[val];
      } else {
        fillColor = stringToColor(val || '');
      }
    } else if (styleConf.type === 'graduated' && styleConf.graduated) {
      const val = Number(feature.properties[styleConf.graduated.field]);
      if (!isNaN(val)) {
        fillColor = getGraduatedColor(val, styleConf.graduated);
      }
    }

    const isHighlighted = matchesHighlight(feature.properties, styleConf.highlight);
    const hl = isHighlighted ? styleConf.highlight : undefined;

    return {
      fillColor,
      color: hl?.color ?? styleConf.color ?? "white",
      weight: hl?.weight ?? styleConf.weight ?? 1,
      fillOpacity: hl?.fillOpacity ?? styleConf.opacity ?? 0.6
    };
  }

  if (layerConfig.type === 'point') {
    const styleConf = layerConfig.style as PointStyleConfig;
    let fillColor = styleConf.fillColor;

    if (styleConf.type === 'category' && styleConf.field) {
      const val = feature.properties[styleConf.field];
      if (styleConf.color_dict && styleConf.color_dict[val]) {
        fillColor = styleConf.color_dict[val];
      } else {
        fillColor = stringToColor(val || '');
      }
    } else if (styleConf.type === 'graduated' && styleConf.graduated) {
      const val = Number(feature.properties[styleConf.graduated.field]);
      if (!isNaN(val)) {
        fillColor = getGraduatedColor(val, styleConf.graduated);
      }
    }

    const radius = resolveFeatureRadius(feature.properties, styleConf, dataRange);
    const isHighlighted = matchesHighlight(feature.properties, styleConf.highlight);
    const hl = isHighlighted ? styleConf.highlight : undefined;

    return {
      radius: radius + (hl?.radiusBoost ?? 0),
      fillColor,
      color: hl?.color ?? styleConf.color ?? "#000",
      weight: hl?.weight ?? styleConf.weight ?? 1,
      fillOpacity: hl?.fillOpacity ?? styleConf.fillOpacity ?? 0.8
    };
  }

  return {};
}

// ---------------------------------------------------------------------------
// GeoJSON cache
// ---------------------------------------------------------------------------

const geoJsonCache = new Map<string, any>();

async function fetchGeoJSON(url: string): Promise<any> {
  if (geoJsonCache.has(url)) {
    return geoJsonCache.get(url);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
  }
  const data = await response.json();
  geoJsonCache.set(url, data);
  return data;
}

// ---------------------------------------------------------------------------
// mapLayout — main rendering engine
// ---------------------------------------------------------------------------

export interface MapLayoutCallbacks {
  onHover?: (
    feature: Record<string, unknown>,
    position: { x: number; y: number },
    layerStyle: Record<string, unknown>,
    layerConfig: LayerConfig,
  ) => void;
  onHoverEnd?: () => void;
}

export interface MapLayoutResult {
  map: any;
  layerRefs: Record<string, any>;
  allFeatures: Array<{ properties: Record<string, unknown>; id?: string; geometry?: any }>;
}

export async function mapLayout(
  container: HTMLElement,
  config: MapConfig,
  callbacks?: MapLayoutCallbacks,
): Promise<MapLayoutResult> {
  const L = (await import('leaflet')).default;

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });

  const map = L.map(container, {
    attributionControl: false,
    zoomControl: false,
  }).setView(config.center, config.zoom);

  L.control.zoom({ position: 'topleft' }).addTo(map);

  L.control.attribution({ prefix: false }).addTo(map);
  map.attributionControl.addAttribution(
    '<a href="/copyright" target="_blank">© ShtetlAtlas</a> | © <a href="https://carto.com">CARTO</a>'
  );

  L.tileLayer(config.tile.src, {
    attribution: '',
    subdomains: config.tile.subdomains,
    maxZoom: config.tile.maxZoom
  }).addTo(map);

  const mapStyles = document.createElement('style');
  mapStyles.textContent = `
    .leaflet-control-zoom { border: none !important; box-shadow: none !important; background: transparent !important; display: flex; flex-direction: column; gap: 8px; }
    .leaflet-control-zoom a { width: 40px !important; height: 40px !important; line-height: 40px !important; font-size: 0 !important; display: flex !important; align-items: center; justify-content: center; background: white !important; color: #374151 !important; border: none !important; border-radius: 50% !important; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
    .leaflet-control-zoom a:hover { background: #f3f4f6 !important; color: #166534 !important; box-shadow: 0 3px 8px rgba(0,0,0,0.2); }
    .leaflet-control-zoom-in span, .leaflet-control-zoom-out span { display: none !important; }
    .leaflet-control-zoom-in::after { content: ''; display: block; width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E") center/contain no-repeat; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M12 5v14M5 12h14'/%3E%3C/svg%3E") center/contain no-repeat; }
    .leaflet-control-zoom-out::after { content: ''; display: block; width: 16px; height: 16px; background: currentColor; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E") center/contain no-repeat; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='M5 12h14'/%3E%3C/svg%3E") center/contain no-repeat; }
    .leaflet-control-attribution { font-size: 11px !important; background: rgba(255,255,255,0.7) !important; padding: 2px 8px !important; }
    .leaflet-control-attribution a { color: #166534 !important; }
  `;
  container.appendChild(mapStyles);

  if (config.customCSS) {
    const style = document.createElement('style');
    style.textContent = config.customCSS;
    container.appendChild(style);
  }

  const layers = config.layers || [];
  const layerRefs: Record<string, any> = {};
  const allFeatures: MapLayoutResult['allFeatures'] = [];

  for (const layerConfig of layers) {
    if (!layerConfig.visible) continue;

    try {
      let geoJsonData = layerConfig.data;

      if (!geoJsonData) {
        let fetchUrl: string | null = null;

        if (layerConfig.sourceType === 'database' && layerConfig.id) {
          const apiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || '';
          fetchUrl = `${apiUrl}/api/geo/geojson/${layerConfig.id}`;
        } else if (layerConfig.url) {
          fetchUrl = layerConfig.url;
        }

        if (fetchUrl) {
          geoJsonData = await fetchGeoJSON(fetchUrl);
        }
      }

      if (!geoJsonData) {
        console.warn(`Layer "${layerConfig.name}" has no data and no URL, skipping`);
        continue;
      }

      const layerKey = layerConfig.id || layerConfig.name;

      // Precompute data range for graduated radius
      let layerDataRange: { min: number; max: number } | undefined;
      if (layerConfig.type === 'point') {
        const pointStyle = layerConfig.style as PointStyleConfig;
        if (pointStyle.graduatedRadius) {
          const field = pointStyle.graduatedRadius.field;
          const features = (geoJsonData as any).features || [];
          const values = features
            .map((f: any) => Number(f.properties?.[field]))
            .filter((v: number) => !isNaN(v) && v > 0);
          if (values.length > 0) {
            layerDataRange = { min: Math.min(...values), max: Math.max(...values) };
          }
        }
      }

      const geoJsonLayer = L.geoJSON(geoJsonData as any, {
        filter: (feature: any) => {
          if (!layerConfig.filter) return true;
          const { field, exclude, include } = layerConfig.filter;
          if (!field) return true;
          const val = feature.properties[field];
          if (exclude && exclude.includes(val)) return false;
          if (include && include.length > 0 && !include.includes(val)) return false;
          return true;
        },

        style: (feature: any) => {
          if (layerConfig.type === 'polygon') {
            return getStyle(feature, layerConfig);
          }
          return {};
        },

        pointToLayer: (feature: any, latlng: any) => {
          if (layerConfig.type === 'point') {
            const resolvedStyle = getStyle(feature, layerConfig, layerDataRange);
            return L.circleMarker(latlng, resolvedStyle);
          }
          return L.marker(latlng);
        },

        onEachFeature: (feature: any, layer: any) => {
          // Collect features for search
          allFeatures.push({
            properties: feature.properties,
            id: feature.properties?.[layerConfig.feature_id || 'id'] ?? feature.id ?? layerKey + '-' + allFeatures.length,
            geometry: feature.geometry,
          });

          // Labels / Tooltips
          if (layerConfig.labels && layerConfig.labels.show) {
            const lblConf = layerConfig.labels;
            const val = feature.properties[lblConf.field];

            let showLabel: boolean;
            if (layerConfig.type === 'polygon') {
              showLabel = true;
              if (lblConf.exclude_list && lblConf.exclude_list.includes(val)) {
                showLabel = false;
              }
            } else {
              showLabel = false;
              if (lblConf.include_list && lblConf.include_list.includes(val)) {
                showLabel = true;
              }
            }

            if (val && showLabel) {
              const tooltipContent = `<span style="
                font-size: ${lblConf.fontSize || 14}px;
                color: ${lblConf.fontColor || '#000000'};
                font-family: ${lblConf.fontFamily || 'Arial, sans-serif'};
                font-weight: ${lblConf.fontWeight || 'normal'};
              ">${String(val)}</span>`;

              const isPolygon = layerConfig.type === 'polygon';
              const baseClass = isPolygon ? "map-label" : "";
              const customClass = lblConf.className || "";
              const tooltipClass = [baseClass, customClass].filter(Boolean).join(" ");
              layer.bindTooltip(tooltipContent, {
                permanent: true,
                direction: lblConf.position || "center",
                className: tooltipClass
              });
            }
          }

          // Popups
          if (layerConfig.popup && layerConfig.popup.show) {
            const popupConf = layerConfig.popup;
            let popupContent = "";

            if (popupConf.type === 'template' && popupConf.template) {
              let content = popupConf.template;
              for (const [key, value] of Object.entries(feature.properties)) {
                content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
              }
              popupContent = content;
            } else {
              popupContent = "<table>";
              const fieldsToShow = popupConf.fields && popupConf.fields.length > 0
                ? popupConf.fields
                : Object.keys(feature.properties);

              for (const key of fieldsToShow) {
                const value = feature.properties[key];
                popupContent += `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`;
              }
              popupContent += "</table>";
            }

            if (popupContent) {
              layer.bindPopup(popupContent);
            }
          }

          // Hover effects
          if (layerConfig.hover?.enable && callbacks?.onHover) {
            const hoverStyleOverrides = layerConfig.hover.style;

            layer.on('mouseover', (e: any) => {
              const originalStyle = getStyle(feature, layerConfig, layerDataRange);

              const highlightStyle: Record<string, unknown> = { ...originalStyle };
              if (hoverStyleOverrides?.fillOpacity != null) {
                highlightStyle.fillOpacity = hoverStyleOverrides.fillOpacity;
              } else {
                const cur = typeof originalStyle.fillOpacity === 'number' ? originalStyle.fillOpacity : 0.6;
                highlightStyle.fillOpacity = Math.min(1, cur + 0.2);
              }
              if (hoverStyleOverrides?.weight != null) {
                highlightStyle.weight = hoverStyleOverrides.weight;
              } else {
                const cur = typeof originalStyle.weight === 'number' ? originalStyle.weight : 1;
                highlightStyle.weight = (cur as number) + 1;
              }
              if (hoverStyleOverrides?.color != null) {
                highlightStyle.color = hoverStyleOverrides.color;
              }

              layer.setStyle(highlightStyle);
              if (layer.bringToFront) layer.bringToFront();

              callbacks.onHover!(
                feature.properties,
                { x: e.originalEvent.clientX, y: e.originalEvent.clientY },
                originalStyle,
                layerConfig,
              );
            });

            layer.on('mouseout', () => {
              const originalStyle = getStyle(feature, layerConfig, layerDataRange);
              layer.setStyle(originalStyle);
              callbacks.onHoverEnd?.();
            });
          }
        }
      });

      // z-index via pane
      if (layerConfig.zIndex != null) {
        const paneName = `layer-pane-${layerKey}`;
        map.createPane(paneName);
        map.getPane(paneName)!.style.zIndex = String(400 + layerConfig.zIndex);
        geoJsonLayer.options.pane = paneName;
      }

      // min/max zoom visibility
      if (layerConfig.minZoom != null || layerConfig.maxZoom != null) {
        const checkZoomVisibility = () => {
          const currentZoom = map.getZoom();
          const visible = (layerConfig.minZoom == null || currentZoom >= layerConfig.minZoom)
            && (layerConfig.maxZoom == null || currentZoom <= layerConfig.maxZoom);
          if (visible && !map.hasLayer(geoJsonLayer)) {
            map.addLayer(geoJsonLayer);
          } else if (!visible && map.hasLayer(geoJsonLayer)) {
            map.removeLayer(geoJsonLayer);
          }
        };
        map.on('zoomend', checkZoomVisibility);
        checkZoomVisibility();
      } else {
        geoJsonLayer.addTo(map);
      }

      layerRefs[layerKey] = geoJsonLayer;

      // Label collision detection
      if (layerConfig.labels?.collision === 'hide') {
        const priorityField = layerConfig.labels.priorityField;
        const trackedLabels: Array<{ layer: any; priority: number }> = [];

        geoJsonLayer.eachLayer((l: any) => {
          const tooltip = l.getTooltip?.();
          if (!tooltip) return;
          const priority = priorityField
            ? Number(l.feature?.properties?.[priorityField]) || 0
            : 0;
          trackedLabels.push({ layer: l, priority });
        });

        const updateCollisions = () => {
          const sorted = [...trackedLabels].sort((a, b) => b.priority - a.priority);
          const placed: DOMRect[] = [];
          for (const { layer: tl } of sorted) {
            const tooltip = tl.getTooltip?.();
            if (!tooltip) continue;
            const el = tooltip.getElement?.() as HTMLElement | null;
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) { el.style.display = 'none'; continue; }
            const overlaps = placed.some(
              p => !(rect.right < p.left || rect.left > p.right || rect.bottom < p.top || rect.top > p.bottom),
            );
            if (overlaps) { el.style.display = 'none'; }
            else { el.style.display = ''; placed.push(rect); }
          }
        };

        setTimeout(updateCollisions, 500);
        map.on('zoomend moveend', updateCollisions);
      }
    } catch (error) {
      console.error(`Error loading layer "${layerConfig.name}":`, error);
    }
  }

  return { map, layerRefs, allFeatures };
}
