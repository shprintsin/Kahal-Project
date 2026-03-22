import type { MapConfig, LayerConfig, PolygonStyleConfig, PointStyleConfig, GraduatedStyleConfig } from '../types/map-config';

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
    let value = (hash >> (i * 8)) & 0xFF;
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
// Style resolver (supports simple, category, graduated for both polygon+point)
// ---------------------------------------------------------------------------

export function getStyle(feature: any, layerConfig: LayerConfig): Record<string, unknown> {
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

    return {
      fillColor,
      color: styleConf.color || "white",
      weight: styleConf.weight || 1,
      fillOpacity: styleConf.opacity || 0.6
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

    return {
      radius: styleConf.radius || 4,
      fillColor,
      color: styleConf.color || "#000",
      weight: styleConf.weight || 1,
      fillOpacity: styleConf.fillOpacity || 0.8
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

  const map = L.map(container).setView(config.center, config.zoom);

  L.tileLayer(config.tile.src, {
    attribution: config.tile.attribution,
    subdomains: config.tile.subdomains,
    maxZoom: config.tile.maxZoom
  }).addTo(map);

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
            const resolvedStyle = getStyle(feature, layerConfig);
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
              const originalStyle = getStyle(feature, layerConfig);

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
              const originalStyle = getStyle(feature, layerConfig);
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
    } catch (error) {
      console.error(`Error loading layer "${layerConfig.name}":`, error);
    }
  }

  return { map, layerRefs, allFeatures };
}
