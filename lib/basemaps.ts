export interface BasemapConfig {
  name: string;
  url: string;
  attribution: string;
  dark?: boolean;
}

export const BASEMAPS: Record<string, BasemapConfig> = {
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

const DEFAULT_TILE = {
  src: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 18,
  subdomains: 'abc',
  attribution: '© OpenStreetMap contributors',
};

export function resolveBasemapTile(
  basemapKey?: string,
  tileOverride?: { src: string; maxZoom?: number; subdomains?: string; attribution?: string },
): { src: string; maxZoom: number; subdomains: string; attribution: string } {
  if (tileOverride?.src) return { ...DEFAULT_TILE, ...tileOverride };
  const bm = basemapKey ? BASEMAPS[basemapKey] : undefined;
  if (bm) {
    return {
      src: bm.url,
      maxZoom: 19,
      subdomains: 'abc',
      attribution: bm.attribution,
    };
  }
  return DEFAULT_TILE;
}
