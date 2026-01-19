// Panama City Central - Building Visualization Configuration
// Floor coordinate mapping for facade image hotspots

/**
 * Facade Image Details:
 * - Source: Pull Man Cropped Image.PNG
 * - Building position: Centered, prominent view with less cityscape
 *
 * IMPORTANT: These coordinates are ESTIMATES and need visual calibration.
 * Run the app and adjust values until hotspots align with actual floors.
 */

// Floor range for building visualization (all floors 17-25)
export const MIN_FLOOR = 17
export const MAX_FLOOR = 25  // All floors including amenities
export const TOTAL_FLOORS = MAX_FLOOR - MIN_FLOOR + 1 // 9 floors total
export const UNITS_PER_FLOOR = 14

/**
 * BUILDING_CONFIG - Single source of truth for floor overlay positioning
 * These percentages map to the pullman-facade-v2.png image
 *
 * Calibrated by visual inspection:
 * - top: Where floor 25 (top floor) starts
 * - bottom: Where floor 17 (bottom floor) ends
 * - left/right: Horizontal bounds of the building facade
 */
export const BUILDING_CONFIG = {
  top: 22,      // Start of executive floors (floor 25)
  bottom: 44,   // End of executive floors (floor 17) - tighter mapping to actual floor bands
  left: 30,     // Left edge of building
  right: 70,    // Right edge of building
}

// Residential vs Amenity floor classification
export const MAX_RESIDENTIAL_FLOOR = 23  // Floors 17-23 have apartments
export const RESIDENTIAL_FLOORS = 7  // 7 residential floors (17-23)
export const AMENITY_FLOORS = [24, 25] as const
export const AMENITY_FLOOR_LABELS: Record<number, string> = {
  24: 'Sky Lounge & Gym',
  25: 'Rooftop Pool & Bar',
}

// Helper to check if floor is amenity
export const isAmenityFloor = (floor: number): boolean =>
  AMENITY_FLOORS.includes(floor as typeof AMENITY_FLOORS[number])

/**
 * Floor position mapping on facade image (pullman-facade-v2.png)
 * All values are percentages of image dimensions
 *
 * These are auto-calculated from BUILDING_CONFIG for consistency.
 * span = bottom - top = 42%
 * height per floor = 42 / 9 = 4.67%
 */
const FLOOR_HEIGHT = (BUILDING_CONFIG.bottom - BUILDING_CONFIG.top) / TOTAL_FLOORS

export const FLOOR_POSITIONS: Record<number, {
  top: number
  height: number
  left: number
  right: number
}> = Object.fromEntries(
  Array.from({ length: TOTAL_FLOORS }, (_, i) => {
    const floor = MAX_FLOOR - i
    return [floor, {
      top: BUILDING_CONFIG.top + (i * FLOOR_HEIGHT),
      height: FLOOR_HEIGHT,
      left: BUILDING_CONFIG.left,
      right: BUILDING_CONFIG.right,
    }]
  })
)

/**
 * Building boundary on the facade image
 * Used for constraining zoom and calculating transforms
 */
export const BUILDING_BOUNDS = {
  // Where the Pullman building sits in the image (percentages)
  // New image (pullman-facade-v2.png): Building is centered
  top: 10,      // Top of building (roof structures)
  bottom: 65,   // Base of building
  left: 28,     // Left edge
  right: 72,    // Right edge

  // Center point for zoom calculations
  centerX: 50,
  centerY: 38,  // Center of golden section
}

/**
 * Zoom animation configuration for Framer Motion
 */
export const ZOOM_CONFIG = {
  // Zoom levels
  default: 1,
  floorView: 2.5,
  maxZoom: 3,

  // Animation timing
  duration: 0.8,
  ease: [0.33, 1, 0.68, 1] as const, // easeOutCubic

  // Reverse animation (zoom out)
  reverseDuration: 0.6,
}

/**
 * Calculate zoom focus point for a specific floor
 * Returns the Y offset needed to center the floor in view
 */
export function getFloorFocusPoint(floor: number): { x: number; y: number } {
  const pos = FLOOR_POSITIONS[floor]
  if (!pos) {
    return { x: 0, y: 0 }
  }

  // Calculate Y offset to center this floor
  // When zoomed 2.5x, we need to offset to bring floor to center
  const floorCenter = pos.top + (pos.height / 2)
  const viewCenter = 50 // Middle of viewport
  const yOffset = (viewCenter - floorCenter) * (ZOOM_CONFIG.floorView - 1)

  return {
    x: 0,
    y: yOffset,
  }
}

/**
 * Floor status types
 */
export type FloorStatus = 'available' | 'limited' | 'sold' | 'empty'

/**
 * Status color mapping
 */
export const STATUS_COLORS = {
  available: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-400',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  limited: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-400',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  sold: {
    bg: 'bg-slate-500/20',
    border: 'border-slate-400',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
  },
  empty: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-600',
    text: 'text-slate-500',
    dot: 'bg-slate-500',
  },
}

/**
 * Helper: Generate array of floor numbers (descending)
 */
export function getFloorArray(): number[] {
  return Array.from(
    { length: TOTAL_FLOORS },
    (_, i) => MAX_FLOOR - i
  )
}

/**
 * Helper: Generate unit numbers for a floor
 */
export function getUnitArray(): number[] {
  return Array.from(
    { length: UNITS_PER_FLOOR },
    (_, i) => i + 1
  )
}
