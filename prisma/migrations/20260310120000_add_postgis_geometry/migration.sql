-- Enable PostGIS extension (should already be enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geometry column to layers table
ALTER TABLE layers ADD COLUMN IF NOT EXISTS geom geometry(Geometry, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_layers_geom ON layers USING GIST (geom);

-- Function to auto-convert GeoJSON to geometry on insert/update
CREATE OR REPLACE FUNCTION update_layer_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geojson_data IS NOT NULL THEN
    BEGIN
      -- For FeatureCollection, extract all geometries into a GeometryCollection
      IF (NEW.geojson_data->>'type') = 'FeatureCollection' THEN
        NEW.geom = ST_Collect(
          ARRAY(
            SELECT ST_SetSRID(ST_GeomFromGeoJSON(feature->'geometry'), 4326)
            FROM jsonb_array_elements(NEW.geojson_data->'features') AS feature
            WHERE feature->'geometry' IS NOT NULL
          )
        );
      -- For single Feature, extract geometry directly
      ELSIF (NEW.geojson_data->>'type') = 'Feature' THEN
        NEW.geom = ST_SetSRID(ST_GeomFromGeoJSON(NEW.geojson_data->'geometry'), 4326);
      -- For raw geometry
      ELSE
        NEW.geom = ST_SetSRID(ST_GeomFromGeoJSON(NEW.geojson_data::text), 4326);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, leave geom as NULL
      NEW.geom = NULL;
    END;
  ELSE
    NEW.geom = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic geometry conversion
DROP TRIGGER IF EXISTS layer_geom_trigger ON layers;
CREATE TRIGGER layer_geom_trigger
  BEFORE INSERT OR UPDATE OF geojson_data ON layers
  FOR EACH ROW
  EXECUTE FUNCTION update_layer_geom();

-- Backfill existing layers that have GeoJSON data
UPDATE layers SET geom = NULL WHERE geojson_data IS NOT NULL;
UPDATE layers SET geojson_data = geojson_data WHERE geojson_data IS NOT NULL;
