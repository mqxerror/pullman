-- Pullman Hotel & Casino Panama - Executive Suites Table
-- This table is separate from the Santa Maria executive_suites table

-- Create the pullman_suites table
CREATE TABLE IF NOT EXISTS pullman_suites (
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

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_pullman_suites_floor ON pullman_suites(floor);
CREATE INDEX IF NOT EXISTS idx_pullman_suites_status ON pullman_suites(status);
CREATE INDEX IF NOT EXISTS idx_pullman_suites_floor_status ON pullman_suites(floor, status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_pullman_suites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pullman_suites_updated_at ON pullman_suites;
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

-- Enable Row Level Security (optional - can be configured later)
ALTER TABLE pullman_suites ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON pullman_suites
  FOR SELECT
  USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON pullman_suites
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Seed data: 126 suites across floors 17-25 (14 units per floor)
-- Suite types based on size:
-- - Premium Suite: >= 80 sqm
-- - Deluxe Suite: >= 65 sqm
-- - Executive Suite: < 65 sqm

INSERT INTO pullman_suites (floor, unit_number, size_sqm, suite_type, status, price_usd, price_display, notes)
SELECT
  floor,
  unit_number,
  -- Size varies by position: corner units larger, middle units smaller
  CASE
    WHEN unit_number IN (1, 7, 8, 14) THEN 75 + (RANDOM() * 15)::NUMERIC(4,2)  -- Corner units: 75-90 sqm
    WHEN unit_number IN (2, 6, 9, 13) THEN 65 + (RANDOM() * 10)::NUMERIC(4,2)  -- Near-corner: 65-75 sqm
    ELSE 55 + (RANDOM() * 10)::NUMERIC(4,2)  -- Middle units: 55-65 sqm
  END AS size_sqm,
  -- Suite type based on size
  CASE
    WHEN unit_number IN (1, 7, 8, 14) THEN 'Premium Suite'
    WHEN unit_number IN (2, 6, 9, 13) THEN 'Deluxe Suite'
    ELSE 'Executive Suite'
  END AS suite_type,
  -- Status distribution: 70% available, 20% reserved, 10% sold
  CASE
    WHEN RANDOM() < 0.1 THEN 'sold'
    WHEN RANDOM() < 0.3 THEN 'reserved'
    ELSE 'available'
  END AS status,
  -- Price based on floor and suite type (higher floors = premium)
  CASE
    WHEN unit_number IN (1, 7, 8, 14) THEN 280000 + ((floor - 17) * 10000) + (RANDOM() * 20000)::INTEGER
    WHEN unit_number IN (2, 6, 9, 13) THEN 220000 + ((floor - 17) * 8000) + (RANDOM() * 15000)::INTEGER
    ELSE 180000 + ((floor - 17) * 6000) + (RANDOM() * 10000)::INTEGER
  END AS price_usd,
  'Contact for Pricing' AS price_display,
  NULL AS notes
FROM
  generate_series(17, 25) AS floor,
  generate_series(1, 14) AS unit_number;

-- Update suite types based on actual generated sizes
UPDATE pullman_suites
SET suite_type = CASE
  WHEN size_sqm >= 80 THEN 'Premium Suite'
  WHEN size_sqm >= 65 THEN 'Deluxe Suite'
  ELSE 'Executive Suite'
END;

-- Verify the data
-- SELECT floor, COUNT(*) as units,
--        COUNT(*) FILTER (WHERE status = 'available') as available
-- FROM pullman_suites
-- GROUP BY floor
-- ORDER BY floor DESC;
