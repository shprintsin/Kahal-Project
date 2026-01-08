import type { FeatureCollection, Geometry } from 'geojson';
import type { GeoJSONInfo, GeometryType } from '../types/config.types';

/**
 * Parse and validate GeoJSON data
 */
export function parseGeoJSON(data: any): FeatureCollection | null {
  try {
    // Check if it's already a FeatureCollection
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      return data as FeatureCollection;
    }
    
    // If it's a single Feature, wrap it
    if (data.type === 'Feature') {
      return {
        type: 'FeatureCollection',
        features: [data]
      };
    }
    
    // If it's just a Geometry, wrap it in a Feature
    if (data.type && ['Point', 'Polygon', 'LineString', 'MultiPoint', 'MultiPolygon', 'MultiLineString'].includes(data.type)) {
      return {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: data,
          properties: {}
        }]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GeoJSON:', error);
    return null;
  }
}

/**
 * Detect the primary geometry type in a FeatureCollection
 */
export function detectGeometryType(featureCollection: FeatureCollection): GeometryType | null {
  if (!featureCollection.features || featureCollection.features.length === 0) {
    return null;
  }
  
  // Get the first feature's geometry type
  const firstGeometry = featureCollection.features[0].geometry;
  if (!firstGeometry) return null;
  
  return firstGeometry.type as GeometryType;
}

/**
 * Extract all unique property keys from features
 */
export function extractProperties(featureCollection: FeatureCollection): string[] {
  const propertySet = new Set<string>();
  
  featureCollection.features.forEach(feature => {
    if (feature.properties) {
      Object.keys(feature.properties).forEach(key => propertySet.add(key));
    }
  });
  
  return Array.from(propertySet);
}

/**
 * Extract unique values for a specific property field
 */
export function extractUniqueValues(featureCollection: FeatureCollection, field: string): string[] {
  const valueSet = new Set<string>();
  
  featureCollection.features.forEach(feature => {
    if (feature.properties && feature.properties[field] !== undefined) {
      const value = String(feature.properties[field]);
      valueSet.add(value);
    }
  });
  
  return Array.from(valueSet).sort();
}

/**
 * Get comprehensive information about a GeoJSON FeatureCollection
 */
export function analyzeGeoJSON(featureCollection: FeatureCollection): GeoJSONInfo | null {
  const geometryType = detectGeometryType(featureCollection);
  if (!geometryType) return null;
  
  const properties = extractProperties(featureCollection);
  const uniqueValues: Record<string, string[]> = {};
  
  // Get unique values for each property
  properties.forEach(prop => {
    const values = extractUniqueValues(featureCollection, prop);
    // Only include if there are reasonable number of unique values (not IDs)
    if (values.length > 0 && values.length <= 100) {
      uniqueValues[prop] = values;
    }
  });
  
  return {
    type: geometryType,
    featureCount: featureCollection.features.length,
    properties,
    uniqueValues
  };
}

/**
 * Validate if data is valid GeoJSON
 */
export function isValidGeoJSON(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  if (data.type === 'FeatureCollection') {
    return Array.isArray(data.features);
  }
  
  if (data.type === 'Feature') {
    return data.geometry && data.properties !== undefined;
  }
  
  return ['Point', 'Polygon', 'LineString', 'MultiPoint', 'MultiPolygon', 'MultiLineString'].includes(data.type);
}

/**
 * Calculate the center point of a FeatureCollection
 */
export function calculateCenter(featureCollection: FeatureCollection): [number, number] {
  let latSum = 0;
  let lngSum = 0;
  let count = 0;
  
  featureCollection.features.forEach(feature => {
    if (feature.geometry) {
      const coords = getCoordinates(feature.geometry);
      coords.forEach(([lng, lat]) => {
        lngSum += lng;
        latSum += lat;
        count++;
      });
    }
  });
  
  return count > 0 ? [latSum / count, lngSum / count] : [0, 0];
}

/**
 * Extract all coordinates from a geometry
 */
function getCoordinates(geometry: Geometry): [number, number][] {
  const coords: [number, number][] = [];
  
  switch (geometry.type) {
    case 'Point':
      coords.push(geometry.coordinates as [number, number]);
      break;
    case 'LineString':
      coords.push(...(geometry.coordinates as [number, number][]));
      break;
    case 'Polygon':
      coords.push(...(geometry.coordinates[0] as [number, number][]));
      break;
    case 'MultiPoint':
      coords.push(...(geometry.coordinates as [number, number][]));
      break;
    case 'MultiLineString':
      geometry.coordinates.forEach(line => {
        coords.push(...(line as [number, number][]));
      });
      break;
    case 'MultiPolygon':
      geometry.coordinates.forEach(polygon => {
        coords.push(...(polygon[0] as [number, number][]));
      });
      break;
  }
  
  return coords;
}
