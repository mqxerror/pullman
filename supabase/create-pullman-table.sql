-- ============================================================================
-- Pullman Hotel & Casino Panama - Create Executive Suites Table
-- ============================================================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fvuhplxmmepnkklgpmlq/editor
--
-- This creates the pullman_suites table with:
-- - 126 suites total (14 units × 9 floors)
-- - ALL apartments set to AVAILABLE status (green)
-- - Public read access enabled via RLS
-- ============================================================================

-- Drop table if it exists (clean start)
DROP TABLE IF EXISTS pullman_suites CASCADE;

-- Create the pullman_suites table
CREATE TABLE pullman_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor INTEGER NOT NULL CHECK (floor >= 17 AND floor <= 25),
  unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 14),
  size_sqm NUMERIC(6,2) NOT NULL CHECK (size_sqm > 0),
  suite_type VARCHAR(50) NOT NULL DEFAULT 'Executive Suite',
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  price_usd NUMERIC(12,2),
  price_display VARCHAR(50) NOT NULL DEFAULT 'Contact for Pricing',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100),
  UNIQUE(floor, unit_number)
);

-- Create indexes for performance
CREATE INDEX idx_pullman_suites_floor ON pullman_suites(floor);
CREATE INDEX idx_pullman_suites_status ON pullman_suites(status);
CREATE INDEX idx_pullman_suites_floor_status ON pullman_suites(floor, status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pullman_suites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pullman_suites_updated_at
  BEFORE UPDATE ON pullman_suites
  FOR EACH ROW
  EXECUTE FUNCTION update_pullman_suites_updated_at();

-- Create floor summary view
CREATE OR REPLACE VIEW pullman_floor_summary AS
SELECT
  floor,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status = 'reserved') as reserved,
  COUNT(*) FILTER (WHERE status = 'sold') as sold
FROM pullman_suites
GROUP BY floor
ORDER BY floor DESC;

-- ============================================================================
-- ENABLE PUBLIC READ ACCESS (Important for frontend)
-- ============================================================================
ALTER TABLE pullman_suites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (SELECT) - this fixes the 401 error
CREATE POLICY "Allow public read access" ON pullman_suites
  FOR SELECT
  USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON pullman_suites
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- INSERT DATA: 126 suites (14 units × 9 floors)
-- ALL SET TO AVAILABLE STATUS (GREEN)
-- ============================================================================
INSERT INTO pullman_suites (floor, unit_number, size_sqm, suite_type, status, price_usd, price_display, notes)
SELECT
  floor,
  unit_number,
  -- Accurate sizes from official PDF: 01_EXECUTIVE SUITES N1700@2500.pdf
  CASE unit_number
    WHEN 1 THEN 53.35
    WHEN 2 THEN 85.10
    WHEN 3 THEN 54.30
    WHEN 4 THEN 53.53
    WHEN 5 THEN 56.80
    WHEN 6 THEN 63.80
    WHEN 7 THEN 74.46
    WHEN 8 THEN 65.55
    WHEN 9 THEN 84.60
    WHEN 10 THEN 64.53
    WHEN 11 THEN 74.46
    WHEN 12 THEN 63.80
    WHEN 13 THEN 56.88
    WHEN 14 THEN 53.53
  END AS size_sqm,
  -- Suite type classification (matching suiteData.ts)
  CASE
    WHEN unit_number IN (2, 9) THEN 'Premium Suite'      -- Type B (largest suites)
    WHEN unit_number IN (6, 7, 8, 10, 11, 12) THEN 'Deluxe Suite'  -- Types D & E
    ELSE 'Executive Suite'  -- Types A & C (units 1, 3, 4, 5, 13, 14)
  END AS suite_type,
  -- ALL AVAILABLE (GREEN) - as requested
  'available' AS status,
  -- Pricing based on floor and suite type
  CASE
    WHEN unit_number IN (1, 9) THEN 280000 + ((floor - 17) * 10000)
    WHEN unit_number IN (5, 6, 7, 8, 10, 11, 12, 13) THEN 220000 + ((floor - 17) * 8000)
    ELSE 180000 + ((floor - 17) * 6000)
  END AS price_usd,
  'Contact for Pricing' AS price_display,
  NULL AS notes
FROM
  generate_series(17, 25) AS floor,
  generate_series(1, 14) AS unit_number;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Check total count (should be 126)
SELECT COUNT(*) as total_suites FROM pullman_suites;

-- Check status distribution (should all be 'available')
SELECT status, COUNT(*) as count FROM pullman_suites GROUP BY status;

-- Check floor distribution
SELECT floor, COUNT(*) as units FROM pullman_suites GROUP BY floor ORDER BY floor DESC;

-- Sample data from each floor
SELECT floor, unit_number, size_sqm, suite_type, status
FROM pullman_suites
WHERE floor IN (17, 20, 25) AND unit_number <= 3
ORDER BY floor DESC, unit_number;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
SELECT '✅ Pullman table created successfully!' as message,
       '✅ 126 suites inserted' as suites,
       '✅ All apartments set to AVAILABLE (green)' as status,
       '✅ Public read access enabled' as access;
