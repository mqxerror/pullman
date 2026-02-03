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

// Floor range for building visualization (all floors 17-27)
export const MIN_FLOOR = 17
export const MAX_FLOOR = 27  // All floors including amenities (26=Pool, 27=Beverage)
export const TOTAL_FLOORS = MAX_FLOOR - MIN_FLOOR + 1 // 11 floors total
export const UNITS_PER_FLOOR = 14

/**
 * BUILDING_CONFIG - Single source of truth for floor overlay positioning
 * These percentages map to the pullman-facade-v2.png image
 *
 * Calibrated by visual inspection:
 * - top: Where floor 27 (top floor) starts
 * - bottom: Where floor 17 (bottom floor) ends
 * - left/right: Horizontal bounds of the building facade
 */
export const BUILDING_CONFIG = {
  top: 12.2,    // Start of floor 27 (Y=135px on 1104px image)
  bottom: 71.6, // End of floor 17 (Y=790px on 1104px image)
  left: 26,     // Left edge of building windows
  right: 74,    // Right edge of building windows
}

// Residential vs Amenity floor classification
export const MAX_RESIDENTIAL_FLOOR = 25  // Floors 17-25 have apartments
export const RESIDENTIAL_FLOORS = 9  // 9 residential floors (17-25)
export const AMENITY_FLOORS = [26, 27] as const
export const AMENITY_FLOOR_LABELS: Record<number, string> = {
  26: 'Rooftop Pool',
  27: 'Sky Bar & Lounge',
}

// Helper to check if floor is amenity
export const isAmenityFloor = (floor: number): boolean =>
  AMENITY_FLOORS.includes(floor as typeof AMENITY_FLOORS[number])

/**
 * Floor position mapping on facade image (pullman-building-v4.png)
 * All values are percentages of image dimensions (1104px height)
 *
 * PRECISE per-floor positions calibrated to match actual window rows:
 * - Pixel coordinates converted to percentages
 * - Progressive heights: 50-60px top → 60-75px bottom (perspective)
 * - Floors 27-26 have taller penthouse windows
 */
export const FLOOR_POSITIONS: Record<number, {
  top: number
  height: number
  left: number
  right: number
}> = {
  27: { top: 12.2, height: 5.4, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // Sky Bar - tall penthouse (60px)
  26: { top: 17.7, height: 5.0, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // Rooftop Pool (55px)
  25: { top: 22.6, height: 4.5, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (50px)
  24: { top: 27.2, height: 4.7, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (52px)
  23: { top: 31.9, height: 4.9, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (54px)
  22: { top: 36.8, height: 5.1, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (56px)
  21: { top: 41.8, height: 5.3, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (58px)
  20: { top: 47.1, height: 5.4, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (60px)
  19: { top: 52.5, height: 5.9, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (65px)
  18: { top: 58.4, height: 6.3, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // (70px)
  17: { top: 64.8, height: 6.8, left: BUILDING_CONFIG.left, right: BUILDING_CONFIG.right },  // Bottom floor (75px)
}

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
