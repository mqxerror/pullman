// Panama City Central - Accurate Suite Data
// Based on architectural floor plans from SALES materials (January 2026)

export type CompassDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export interface SuiteInfo {
  unitNumber: number
  type: 'A1' | 'A2' | 'B' | 'C' | 'D' | 'E1' | 'E2' | 'Hotel'
  typeName: string
  sizeSqm: number
  level: string
  rooms: number
  bathrooms: number
  lockoff: boolean
  floorPlanFile: string
  renderingFile?: string
  pdfFile: string
  orientation: CompassDirection
  oceanView: boolean
  viewDescription: string
}

// Executive Suites on Level N1700@2500 (14 units)
// Data source: Official commercial sheets (FICHA PDFs) — orientations & sizes per PDF
export const EXECUTIVE_SUITES: SuiteInfo[] = [
  {
    unitNumber: 1,
    type: 'A1',
    typeName: 'Executive Suite Type A1',
    sizeSqm: 53.35,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-1-3.png',
    pdfFile: '02_FICHA_EXECUTIVE SUITE 1 Y 3_TYPE A.pdf',
    orientation: 'SW',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 2,
    type: 'B',
    typeName: 'Premium Suite Type B',
    sizeSqm: 85.15,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-2-9.png',
    pdfFile: '03_FICHA_EXECUTIVE SUITE 2 Y 9 TYPE B.pdf',
    orientation: 'SW',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 3,
    type: 'A2',
    typeName: 'Executive Suite Type A2',
    sizeSqm: 54.30,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-1-3.png',
    renderingFile: '/assets/suites/executive-suite-type-a-suite-3.jpg',
    pdfFile: '02_FICHA_EXECUTIVE SUITE 1 Y 3_TYPE A.pdf',
    orientation: 'SW',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 4,
    type: 'A2',
    typeName: 'Executive Suite Type A2',
    sizeSqm: 53.53,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-4-14.png',
    pdfFile: '04_FICHA_EXECUTIVE SUITE 4 Y 14 TYPE C.pdf',
    orientation: 'NW',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 5,
    type: 'C',
    typeName: 'Executive Suite Type C',
    sizeSqm: 56.88,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-5-13.png',
    renderingFile: '/assets/suites/executive-suite-type-c-suite-5.jpg',
    pdfFile: '05_FICHA_EXECUTIVE SUITE 5 Y 13 TYPE C.pdf',
    orientation: 'W',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 6,
    type: 'D',
    typeName: 'Deluxe Suite Type D',
    sizeSqm: 63.80,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-6-12.png',
    pdfFile: '06_FICHA_EXECUTIVE SUITE 6 Y 12 TYPE D.pdf',
    orientation: 'W',
    oceanView: false,
    viewDescription: 'Sunset & City View'
  },
  {
    unitNumber: 7,
    type: 'E1',
    typeName: 'Deluxe Suite Type E1',
    sizeSqm: 74.46,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-7-11.png',
    renderingFile: '/assets/suites/executive-suite-type-e-suite-7.jpg',
    pdfFile: '07_FICHA_EXECUTIVE SUITE 7 Y 11 TYPE E.pdf',
    orientation: 'N',
    oceanView: false,
    viewDescription: 'City View'
  },
  {
    unitNumber: 8,
    type: 'E1',
    typeName: 'Deluxe Suite Type E1',
    sizeSqm: 65.55,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-8-10.png',
    renderingFile: '/assets/suites/executive-suite-type-e-suite-8.jpg',
    pdfFile: '08_FICHA_EXECUTIVE SUITE 8 Y 10 TYPE E.pdf',
    orientation: 'NE',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 9,
    type: 'B',
    typeName: 'Premium Suite Type B',
    sizeSqm: 85.25,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-2-9.png',
    pdfFile: '03_FICHA_EXECUTIVE SUITE 2 Y 9 TYPE B.pdf',
    orientation: 'NE',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 10,
    type: 'E2',
    typeName: 'Deluxe Suite Type E2',
    sizeSqm: 64.53,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-8-10.png',
    pdfFile: '08_FICHA_EXECUTIVE SUITE 8 Y 10 TYPE E.pdf',
    orientation: 'NE',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 11,
    type: 'E2',
    typeName: 'Deluxe Suite Type E2',
    sizeSqm: 74.46,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-7-11.png',
    pdfFile: '07_FICHA_EXECUTIVE SUITE 7 Y 11 TYPE E.pdf',
    orientation: 'E',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 12,
    type: 'D',
    typeName: 'Deluxe Suite Type D',
    sizeSqm: 63.80,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-6-12.png',
    pdfFile: '06_FICHA_EXECUTIVE SUITE 6 Y 12 TYPE D.pdf',
    orientation: 'E',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 13,
    type: 'C',
    typeName: 'Executive Suite Type C',
    sizeSqm: 56.88,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/suite-5-13.png',
    pdfFile: '05_FICHA_EXECUTIVE SUITE 5 Y 13 TYPE C.pdf',
    orientation: 'E',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  },
  {
    unitNumber: 14,
    type: 'A1',
    typeName: 'Executive Suite Type A1',
    sizeSqm: 53.53,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-4-14.png',
    pdfFile: '04_FICHA_EXECUTIVE SUITE 4 Y 14 TYPE C.pdf',
    orientation: 'SE',
    oceanView: false,
    viewDescription: 'Sunrise & City View'
  }
]

// Standard Hotel Rooms on Level N700@1600 (18 units)
// Note: Limited data available - sizes vary from 38.75 m² to 84.20 m²
export const HOTEL_ROOMS: SuiteInfo[] = [
  {
    unitNumber: 1,
    type: 'Hotel',
    typeName: 'Standard Hotel Room',
    sizeSqm: 45, // Approximate - verify from PDF
    level: 'N700@1600',
    rooms: 1,
    bathrooms: 1,
    lockoff: false,
    floorPlanFile: '/assets/floorplans/hotel-room.png',
    renderingFile: '/assets/suites/standard-hotel-room.jpg',
    pdfFile: '01_HOTEL N700@1600.pdf',
    orientation: 'N',
    oceanView: false,
    viewDescription: 'City View'
  }
  // Note: Rooms 2-18 follow similar structure
  // Full data extraction needed from PDF for each room
]

// Helper functions
export const getSuiteInfo = (unitNumber: number): SuiteInfo | undefined => {
  return EXECUTIVE_SUITES.find(suite => suite.unitNumber === unitNumber)
}

export const getSuitesByType = (type: SuiteInfo['type']): SuiteInfo[] => {
  return EXECUTIVE_SUITES.filter(suite => suite.type === type)
}

export const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

export const getSuiteTypeFromLetter = (type: SuiteInfo['type'], sizeSqm: number): string => {
  if ((type === 'E1' || type === 'E2') && sizeSqm >= 80) return 'Premium Suite'
  if (type === 'E1' || type === 'E2' || type === 'D' || (type === 'B' && sizeSqm >= 64)) return 'Deluxe Suite'
  return 'Executive Suite'
}

// ===================================
// ORIENTATION CONFIGURATION
// Based on official commercial sheets (FICHA PDFs)
// North points toward bottom-right corner of floor plan image (~135°)
// ===================================

export const COMPASS_LABELS: Record<CompassDirection, string> = {
  N: 'North',
  NE: 'Northeast',
  E: 'East',
  SE: 'Southeast',
  S: 'South',
  SW: 'Southwest',
  W: 'West',
  NW: 'Northwest',
}

// Floor plan orientation: how the plan image is rotated relative to true North
// North points toward the bottom-right corner of the image (corner of suite 7/8)
// That's ~135° clockwise from image-top
export const FLOOR_PLAN_NORTH_ROTATION = 135

// Export simple size map for backward compatibility
// Data source: Official floor plan map (Feb 2026)
export const SUITE_SIZES: Record<number, number> = {
  1: 53.35,  // Type A1 LOCKOFF
  2: 85.15,  // Type B
  3: 54.30,  // Type A2 LOCKOFF
  4: 53.53,  // Type A2 LOCKOFF
  5: 56.88,  // Type C
  6: 63.80,  // Type D
  7: 74.46,  // Type E1 LOCKOFF
  8: 65.55,  // Type E1 LOCKOFF
  9: 85.25,  // Type B
  10: 64.53, // Type E2 LOCKOFF
  11: 74.46, // Type E2 LOCKOFF
  12: 63.80, // Type D
  13: 56.88, // Type C
  14: 53.53, // Type A1 LOCKOFF
}

// Suite images mapping (only available for certain units)
export const SUITE_IMAGES: Record<number, string> = {
  3: '/assets/suites/executive-suite-type-a-suite-3.jpg',
  5: '/assets/suites/executive-suite-type-c-suite-5.jpg',
  7: '/assets/suites/executive-suite-type-e-suite-7.jpg',
  8: '/assets/suites/executive-suite-type-e-suite-8.jpg',
}

// Default fallback image for suites without specific renders
export const DEFAULT_SUITE_IMAGE = '/assets/gallery/suite-type-07.jpg'

export const getSuiteImage = (unitNumber: number): string => {
  return SUITE_IMAGES[unitNumber] || DEFAULT_SUITE_IMAGE
}

// ===================================
// PRICING CONFIGURATION
// Official rates from January 2026 spreadsheet
// ===================================

// Price per square meter (base $5,500 + 5% modifier)
export const PRICE_PER_SQM = 5775

// Individual suite prices by unit number (size × $5,775/m²)
export const SUITE_PRICES: Record<number, number> = {
  1: 308096.25,  // 53.35 × 5775
  2: 491741.25,  // 85.15 × 5775
  3: 313582.50,  // 54.30 × 5775
  4: 309135.75,  // 53.53 × 5775
  5: 328482.00,  // 56.88 × 5775
  6: 368445.00,  // 63.80 × 5775
  7: 430006.50,  // 74.46 × 5775
  8: 378551.25,  // 65.55 × 5775
  9: 492318.75,  // 85.25 × 5775
  10: 372660.75, // 64.53 × 5775
  11: 430006.50, // 74.46 × 5775
  12: 368445.00, // 63.80 × 5775
  13: 328482.00, // 56.88 × 5775
  14: 309135.75, // 53.53 × 5775
}

// Type mapping: Spreadsheet Type (1-6) to suite unit numbers
export const SUITE_TYPE_MAP: Record<number, number> = {
  1: 1, 2: 6, 3: 5, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 6, 10: 5, 11: 4, 12: 3, 13: 2, 14: 1
}

// ===================================
// PRICING HELPER FUNCTIONS
// ===================================

// Get suite price by unit number
export const getSuitePrice = (unitNumber: number): number => {
  return SUITE_PRICES[unitNumber] || 0
}

// Format price as USD currency (e.g., "$308,096")
export const formatPriceUSD = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

// Format price in short form (e.g., "$308K" or "$1.2M")
export const formatPriceShort = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`
  }
  return `$${Math.round(price / 1000)}K`
}

// Calculate price breakdown info
export const getPriceBreakdown = (unitNumber: number): { price: number; pricePerSqm: number; size: number } => {
  const price = SUITE_PRICES[unitNumber] || 0
  const size = SUITE_SIZES[unitNumber] || 0
  return {
    price,
    pricePerSqm: PRICE_PER_SQM,
    size,
  }
}
