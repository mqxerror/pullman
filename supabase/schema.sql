-- Pullman Hotel & Casino Panama
-- Executive Suites Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. EXECUTIVE SUITES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS executive_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  floor INTEGER NOT NULL CHECK (floor >= 17 AND floor <= 25),
  unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 14),

  -- Suite Info
  size_sqm DECIMAL(5,2) NOT NULL,
  suite_type VARCHAR(20) DEFAULT 'executive',

  -- Status
  status VARCHAR(10) DEFAULT 'available'
    CHECK (status IN ('available', 'reserved', 'sold')),

  -- Pricing (optional - may be "contact for pricing")
  price_usd DECIMAL(12,2),
  price_display VARCHAR(50) DEFAULT 'Contact for Pricing',

  -- Notes
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),

  -- Ensure unique floor/unit combination
  UNIQUE(floor, unit_number)
);

-- Index for common queries
CREATE INDEX idx_suites_floor ON executive_suites(floor);
CREATE INDEX idx_suites_status ON executive_suites(status);
CREATE INDEX idx_suites_floor_status ON executive_suites(floor, status);

-- ============================================
-- 2. SUITE SIZES (Reference data from floor plan)
-- ============================================

-- Unit sizes per floor plan (same for all floors)
-- Unit 1: 53.35m², Unit 2: 85.15m², Unit 3: 54.30m²
-- Unit 4: 53.53m², Unit 5: 56.80m², Unit 6: 63.80m²
-- Unit 7: 74.46m², Unit 8: 65.55m², Unit 9: 82.25m²
-- Unit 10: 64.53m², Unit 11: 74.46m², Unit 12: 63.80m²
-- Unit 13: 56.88m², Unit 14: 53.53m²

-- ============================================
-- 3. SEED DATA - 126 Executive Suites
-- ============================================

-- Generate all 126 units (9 floors × 14 units)
INSERT INTO executive_suites (floor, unit_number, size_sqm, status)
SELECT
  floor,
  unit_number,
  CASE unit_number
    WHEN 1 THEN 53.35
    WHEN 2 THEN 85.15
    WHEN 3 THEN 54.30
    WHEN 4 THEN 53.53
    WHEN 5 THEN 56.80
    WHEN 6 THEN 63.80
    WHEN 7 THEN 74.46
    WHEN 8 THEN 65.55
    WHEN 9 THEN 82.25
    WHEN 10 THEN 64.53
    WHEN 11 THEN 74.46
    WHEN 12 THEN 63.80
    WHEN 13 THEN 56.88
    WHEN 14 THEN 53.53
  END as size_sqm,
  'available' as status
FROM generate_series(17, 25) as floor
CROSS JOIN generate_series(1, 14) as unit_number
ON CONFLICT (floor, unit_number) DO NOTHING;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE executive_suites ENABLE ROW LEVEL SECURITY;

-- Public can read all suites
CREATE POLICY "Suites are viewable by everyone"
  ON executive_suites
  FOR SELECT
  USING (true);

-- Only authenticated admin users can modify
CREATE POLICY "Admin users can modify suites"
  ON executive_suites
  FOR ALL
  USING (
    auth.role() = 'authenticated'
    AND auth.jwt() ->> 'email' IN (
      'admin@pullmanpanama.com',
      'sales@pullmanpanama.com'
      -- Add more admin emails as needed
    )
  );

-- ============================================
-- 5. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON executive_suites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. 360° TOURS TABLES (Phase 2)
-- ============================================

-- Tours (one per suite type)
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_type VARCHAR(20) NOT NULL UNIQUE,  -- 'type-07', 'type-08', etc.
  name VARCHAR(100) NOT NULL,
  description TEXT,
  source VARCHAR(20) DEFAULT 'ai' CHECK (source IN ('ai', 'photo', 'render')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual scenes within a tour
CREATE TABLE IF NOT EXISTS tour_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,           -- 'living', 'bedroom', 'kitchen'
  display_name VARCHAR(100),           -- 'Living Room', 'Master Bedroom'
  panorama_url TEXT NOT NULL,
  thumbnail_url TEXT,
  initial_pitch DECIMAL(5,2) DEFAULT 0,
  initial_yaw DECIMAL(5,2) DEFAULT 180,
  initial_hfov DECIMAL(5,2) DEFAULT 110,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation hotspots between scenes
CREATE TABLE IF NOT EXISTS tour_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES tour_scenes(id) ON DELETE CASCADE,
  target_scene_id UUID REFERENCES tour_scenes(id) ON DELETE SET NULL,
  pitch DECIMAL(5,2) NOT NULL,
  yaw DECIMAL(5,2) NOT NULL,
  label VARCHAR(50) NOT NULL,          -- 'View Kitchen', 'View Bedroom'
  hotspot_type VARCHAR(20) DEFAULT 'navigation'
    CHECK (hotspot_type IN ('navigation', 'info', 'link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on tour tables
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_hotspots ENABLE ROW LEVEL SECURITY;

-- Public read access for tours
CREATE POLICY "Tours are viewable by everyone" ON tours FOR SELECT USING (true);
CREATE POLICY "Tour scenes are viewable by everyone" ON tour_scenes FOR SELECT USING (true);
CREATE POLICY "Tour hotspots are viewable by everyone" ON tour_hotspots FOR SELECT USING (true);

-- ============================================
-- 7. USEFUL VIEWS
-- ============================================

-- Floor summary view
CREATE OR REPLACE VIEW floor_summary AS
SELECT
  floor,
  COUNT(*) as total_units,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status = 'reserved') as reserved,
  COUNT(*) FILTER (WHERE status = 'sold') as sold,
  ROUND(AVG(size_sqm), 2) as avg_size_sqm
FROM executive_suites
GROUP BY floor
ORDER BY floor DESC;

-- Overall stats view
CREATE OR REPLACE VIEW inventory_stats AS
SELECT
  COUNT(*) as total_units,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status = 'reserved') as reserved,
  COUNT(*) FILTER (WHERE status = 'sold') as sold,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'available') / COUNT(*),
    1
  ) as availability_percent,
  MIN(size_sqm) as min_size,
  MAX(size_sqm) as max_size,
  ROUND(AVG(size_sqm), 2) as avg_size
FROM executive_suites;

-- ============================================
-- 8. SAMPLE QUERIES
-- ============================================

-- Get all suites for a floor
-- SELECT * FROM executive_suites WHERE floor = 21 ORDER BY unit_number;

-- Get floor summary
-- SELECT * FROM floor_summary;

-- Get overall stats
-- SELECT * FROM inventory_stats;

-- Get available suites with size > 70m²
-- SELECT floor, unit_number, size_sqm
-- FROM executive_suites
-- WHERE status = 'available' AND size_sqm > 70
-- ORDER BY size_sqm DESC;

-- Update suite status
-- UPDATE executive_suites
-- SET status = 'reserved', notes = 'Client: John Doe'
-- WHERE floor = 21 AND unit_number = 7;
