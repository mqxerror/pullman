-- Migration: Update suite prices with official January 2026 rates
-- Price per sqm: $5,775 (base $5,500 + 5% modifier)

-- Update all suite prices based on unit number
UPDATE pullman_suites SET
  price_usd = CASE unit_number
    WHEN 1 THEN 308096.25
    WHEN 2 THEN 491741.25
    WHEN 3 THEN 313582.50
    WHEN 4 THEN 309135.75
    WHEN 5 THEN 328482.00
    WHEN 6 THEN 368445.00
    WHEN 7 THEN 430006.50
    WHEN 8 THEN 378551.25
    WHEN 9 THEN 492318.75
    WHEN 10 THEN 372660.75
    WHEN 11 THEN 430006.50
    WHEN 12 THEN 368445.00
    WHEN 13 THEN 328482.00
    WHEN 14 THEN 306652.50
  END,
  price_display = '$' || TO_CHAR(
    CASE unit_number
      WHEN 1 THEN 308096 WHEN 2 THEN 491741 WHEN 3 THEN 313583
      WHEN 4 THEN 309136 WHEN 5 THEN 328482 WHEN 6 THEN 368445
      WHEN 7 THEN 430007 WHEN 8 THEN 378551 WHEN 9 THEN 492319
      WHEN 10 THEN 372661 WHEN 11 THEN 430007 WHEN 12 THEN 368445
      WHEN 13 THEN 328482 WHEN 14 THEN 306653
    END, 'FM999,999'
  )
WHERE floor >= 17 AND floor <= 25;

-- Verify the update
-- SELECT floor, unit_number, price_usd, price_display FROM pullman_suites ORDER BY floor, unit_number;
