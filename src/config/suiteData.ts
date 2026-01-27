// Panama City Central - Accurate Suite Data
// Based on architectural floor plans from SALES materials (January 2026)

export interface SuiteInfo {
  unitNumber: number
  type: 'A' | 'B' | 'C' | 'D' | 'E' | 'Hotel'
  typeName: string
  sizeSqm: number
  level: string
  rooms: number
  bathrooms: number
  lockoff: boolean
  floorPlanFile: string
  renderingFile?: string
  pdfFile: string
}

// Executive Suites on Level N1700@2500 (14 units)
// Data source: Official Excel spreadsheet (Jan 21, 2026)
export const EXECUTIVE_SUITES: SuiteInfo[] = [
  {
    unitNumber: 1,
    type: 'A',
    typeName: 'Executive Suite Type A',
    sizeSqm: 53.35,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-1-3.png',
    pdfFile: '02_FICHA_EXECUTIVE SUITE 1 Y 3_TYPE A.pdf'
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
    pdfFile: '03_FICHA_EXECUTIVE SUITE 2 Y 9 TYPE B.pdf'
  },
  {
    unitNumber: 3,
    type: 'A',
    typeName: 'Executive Suite Type A',
    sizeSqm: 54.30,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-1-3.png',
    renderingFile: '/assets/suites/executive-suite-type-a-suite-3.jpg',
    pdfFile: '02_FICHA_EXECUTIVE SUITE 1 Y 3_TYPE A.pdf'
  },
  {
    unitNumber: 4,
    type: 'A',
    typeName: 'Executive Suite Type A',
    sizeSqm: 53.53,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-4-14.png',
    pdfFile: '04_FICHA_EXECUTIVE SUITE 4 Y 14 TYPE C.pdf'
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
    pdfFile: '05_FICHA_EXECUTIVE SUITE 5 Y 13 TYPE C.pdf'
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
    pdfFile: '06_FICHA_EXECUTIVE SUITE 6 Y 12 TYPE D.pdf'
  },
  {
    unitNumber: 7,
    type: 'E',
    typeName: 'Deluxe Suite Type E',
    sizeSqm: 74.46,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-7-11.png',
    renderingFile: '/assets/suites/executive-suite-type-e-suite-7.jpg',
    pdfFile: '07_FICHA_EXECUTIVE SUITE 7 Y 11 TYPE E.pdf'
  },
  {
    unitNumber: 8,
    type: 'E',
    typeName: 'Deluxe Suite Type E',
    sizeSqm: 65.55,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-8-10.png',
    renderingFile: '/assets/suites/executive-suite-type-e-suite-8.jpg',
    pdfFile: '08_FICHA_EXECUTIVE SUITE 8 Y 10 TYPE E.pdf'
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
    pdfFile: '03_FICHA_EXECUTIVE SUITE 2 Y 9 TYPE B.pdf'
  },
  {
    unitNumber: 10,
    type: 'E',
    typeName: 'Deluxe Suite Type E',
    sizeSqm: 64.53,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-8-10.png',
    pdfFile: '08_FICHA_EXECUTIVE SUITE 8 Y 10 TYPE E.pdf'
  },
  {
    unitNumber: 11,
    type: 'E',
    typeName: 'Deluxe Suite Type E',
    sizeSqm: 74.46,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-7-11.png',
    pdfFile: '07_FICHA_EXECUTIVE SUITE 7 Y 11 TYPE E.pdf'
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
    pdfFile: '06_FICHA_EXECUTIVE SUITE 6 Y 12 TYPE D.pdf'
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
    pdfFile: '05_FICHA_EXECUTIVE SUITE 5 Y 13 TYPE C.pdf'
  },
  {
    unitNumber: 14,
    type: 'A',
    typeName: 'Executive Suite Type A',
    sizeSqm: 53.10,
    level: 'N1700@2500',
    rooms: 1,
    bathrooms: 1,
    lockoff: true,
    floorPlanFile: '/assets/floorplans/suite-4-14.png',
    pdfFile: '04_FICHA_EXECUTIVE SUITE 4 Y 14 TYPE C.pdf'
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
    pdfFile: '01_HOTEL N700@1600.pdf'
  }
  // Note: Rooms 2-18 follow similar structure
  // Full data extraction needed from PDF for each room
]

// Helper functions
export const getSuiteInfo = (unitNumber: number): SuiteInfo | undefined => {
  return EXECUTIVE_SUITES.find(suite => suite.unitNumber === unitNumber)
}

export const getSuitesByType = (type: 'A' | 'B' | 'C' | 'D' | 'E'): SuiteInfo[] => {
  return EXECUTIVE_SUITES.filter(suite => suite.type === type)
}

export const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

export const getSuiteTypeFromLetter = (type: 'A' | 'B' | 'C' | 'D' | 'E', sizeSqm: number): string => {
  if (type === 'E' && sizeSqm >= 80) return 'Premium Suite'
  if (type === 'E' || type === 'D' || (type === 'B' && sizeSqm >= 64)) return 'Deluxe Suite'
  return 'Executive Suite'
}

// Export simple size map for backward compatibility
// Data source: Official Excel spreadsheet (Jan 21, 2026)
export const SUITE_SIZES: Record<number, number> = {
  1: 53.35,  // Type A LOCKOFF
  2: 85.15,  // Type B
  3: 54.30,  // Type A LOCKOFF
  4: 53.53,  // Type A LOCKOFF
  5: 56.88,  // Type C
  6: 63.80,  // Type D
  7: 74.46,  // Type E LOCKOFF
  8: 65.55,  // Type E LOCKOFF
  9: 85.25,  // Type B
  10: 64.53, // Type E LOCKOFF
  11: 74.46, // Type E LOCKOFF
  12: 63.80, // Type D
  13: 56.88, // Type C
  14: 53.10, // Type A LOCKOFF
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

// Individual suite prices by unit number
export const SUITE_PRICES: Record<number, number> = {
  1: 308096.25,
  2: 491741.25,
  3: 313582.50,
  4: 309135.75,
  5: 328482.00,
  6: 368445.00,
  7: 430006.50,
  8: 378551.25,
  9: 492318.75,
  10: 372660.75,
  11: 430006.50,
  12: 368445.00,
  13: 328482.00,
  14: 306652.50,
}

// Type mapping: Spreadsheet Type (1-6) to Codebase Type (A-E)
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
