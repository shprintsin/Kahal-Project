import L from 'leaflet';
import type { MapConfig, LayerConfig, PolygonStyleConfig, PointStyleConfig } from '../types/config.types';

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

export function getStyle(feature: any, layerConfig: LayerConfig) {
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
    }

    return {
      fillColor: fillColor,
      color: styleConf.color || "white",
      weight: styleConf.weight || 1,
      fillOpacity: styleConf.opacity || 0.6
    };
  }
  return {};
}

// Simple in-memory cache for GeoJSON data
const geoJsonCache = new Map<string, any>();

async function fetchGeoJSON(url: string): Promise<any> {
  // Check cache first
  if (geoJsonCache.has(url)) {
    // console.log(`Using cached GeoJSON for: ${url}`);
    return geoJsonCache.get(url);
  }

  // console.log(`Fetching GeoJSON from: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Cache the result
  geoJsonCache.set(url, data);
  // console.log(`Cached GeoJSON for: ${url}`);
  
  return data;
}

export async function mapLayout(container: HTMLElement, config: MapConfig): Promise<L.Map> {
  // Create new map
  const map = L.map(container).setView(config.center, config.zoom);
  
  L.tileLayer(config.tile.src, {
    attribution: config.tile.attribution,
    subdomains: config.tile.subdomains,
    maxZoom: config.tile.maxZoom
  }).addTo(map);

  // Add layers
  const layers = config.layers || [];
  
  for (const layerConfig of layers) {
    if (!layerConfig.visible) continue;

    try {
      // Fetch GeoJSON data if not already present
      let geoJsonData = layerConfig.data;
      
      if (!geoJsonData && layerConfig.url) {
        // console.log(`Layer "${layerConfig.name}" has no data, fetching from URL...`);
        geoJsonData = await fetchGeoJSON(layerConfig.url);
      }

      if (!geoJsonData) {
        console.warn(`Layer "${layerConfig.name}" has no data and no URL, skipping`);
        continue;
      }

      const geoJsonLayer = L.geoJSON(geoJsonData as any, {
        // Filtering
        filter: (feature) => {
          if (!layerConfig.filter) return true;
          const { field, exclude, include } = layerConfig.filter;
          if (!field) return true; // No filter field set

          const val = feature.properties[field];

          if (exclude && exclude.includes(val)) return false;
          if (include && include.length > 0 && !include.includes(val)) return false;
          return true;
        },

        // Styling (Polygons)
        style: (feature) => {
          if (layerConfig.type === 'polygon') {
            return getStyle(feature, layerConfig);
          }
          return {};
        },

        // Point to Layer (Points Styling)
        pointToLayer: (feature, latlng) => {
          if (layerConfig.type === 'point') {
            const styleConf = layerConfig.style as PointStyleConfig;
            let fillColor = styleConf.fillColor;

            // Category-based coloring for points
            if (styleConf.type === 'category' && styleConf.field) {
              const val = feature.properties[styleConf.field];
              if (styleConf.color_dict && styleConf.color_dict[val]) {
                fillColor = styleConf.color_dict[val];
              } else {
                fillColor = stringToColor(val || '');
              }
            }

            return L.circleMarker(latlng, {
              radius: styleConf.radius || 4,
              fillColor: fillColor,
              color: styleConf.color || "#000",
              weight: styleConf.weight || 1,
              fillOpacity: styleConf.fillOpacity || 0.8
            });
          }
          return L.marker(latlng);
        },

        // Labels and Popups
        onEachFeature: (feature, layer) => {
          // Labels / Tooltips
          if (layerConfig.labels && layerConfig.labels.show) {
            const lblConf = layerConfig.labels;
            const val = feature.properties[lblConf.field];

            // Different default behavior for polygons vs points
            let showLabel: boolean;
            if (layerConfig.type === 'polygon') {
              // Polygons: Default is to show ALL labels, hide only excluded ones
              showLabel = true;
              if (lblConf.exclude_list && lblConf.exclude_list.includes(val)) {
                showLabel = false;
              }
            } else {
              // Points: Default is to show NO labels, show only included ones
              showLabel = false;
              if (lblConf.include_list && lblConf.include_list.includes(val)) {
                showLabel = true;
              }
            }

            if (val && showLabel) {
              // Create custom tooltip with font styling
              const tooltipContent = `<span style="
                font-size: ${lblConf.fontSize || 14}px;
                color: ${lblConf.fontColor || '#000000'};
                font-family: ${lblConf.fontFamily || 'Arial, sans-serif'};
                font-weight: ${lblConf.fontWeight || 'normal'};
              ">${String(val)}</span>`;
              
              layer.bindTooltip(tooltipContent, {
                permanent: true,
                direction: lblConf.position || "center",
                className: lblConf.className || ""
              });
            }
          }

          // Popups
          if (layerConfig.popup && layerConfig.popup.show) {
              const popupConf = layerConfig.popup;
              let popupContent = "";

              if (popupConf.type === 'template' && popupConf.template) {
                  // Template mode
                  let content = popupConf.template;
                  // Simple regex replacement for {fieldName}
                  for (const [key, value] of Object.entries(feature.properties)) {
                      content = content.replace(new RegExp(`{${key}}`, 'g'), String(value));
                  }
                  popupContent = content;
              } else {
                  // List mode (default or fallback)
                  popupContent = "<table>";
                  const fieldsToShow = popupConf.fields && popupConf.fields.length > 0 
                      ? popupConf.fields 
                      : Object.keys(feature.properties); // Default to all if none selected (or handle empty differently)

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
        }
      });

      geoJsonLayer.addTo(map);
    } catch (error) {
      console.error(`Error loading layer "${layerConfig.name}":`, error);
    }
  }

  return map;
}
