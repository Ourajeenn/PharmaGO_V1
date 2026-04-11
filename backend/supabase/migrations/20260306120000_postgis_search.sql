-- Migration logic for PostGIS
-- Phase 3 : Scale & Rétention

-- 1. Enable PostGIS extension if not exists
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- 2. Ensure your pharmacies table has location capabilities
-- If it doesn't already have geography columns, you could add one, but we can compute dynamically
-- ALTER TABLE pharmacies ADD COLUMN location GEOGRAPHY(POINT, 4326);
-- UPDATE pharmacies SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
-- CREATE INDEX idx_pharmacies_location ON pharmacies USING GIST (location);

-- 3. Create the RPC function that the Edge Function/Frontend will call
-- This function calculates distances securely on the backend.
CREATE OR REPLACE FUNCTION get_pharmacies_nearby(
    target_lat DOUBLE PRECISION, 
    target_lng DOUBLE PRECISION, 
    max_distance_meters DOUBLE PRECISION DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    commune TEXT,
    phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_on_duty BOOLEAN,
    distance DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.address,
    p.commune,
    p.phone,
    p.latitude,
    p.longitude,
    p.is_on_duty,
    -- Compute distance mathematically within PostGIS using Geography point format
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography
    ) AS distance
  FROM 
    pharmacies p
  WHERE
    p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(p.longitude, p.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(target_lng, target_lat), 4326)::geography,
      max_distance_meters
    )
  ORDER BY 
    distance ASC
  LIMIT 20; -- Return max 20 closest pharmacies
END;
$$;
