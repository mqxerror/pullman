// Pullman Hotel - Building Visualization Configuration
// Floor coordinate mapping for facade image hotspots

/**
 * Facade Image Details:
 * - Source: Pull Man Cropped Image.PNG
 * - Building position: Centered, prominent view with less cityscape
 *
 * IMPORTANT: These coordinates are ESTIMATES and need visual calibration.
 * Run the app and adjust values until hotspots align with actual floors.
 */

// Floor range for Executive Suites
export const MIN_FLOOR = 17
export const MAX_FLOOR = 25
export const TOTAL_FLOORS = MAX_FLOOR - MIN_FLOOR + 1 // 9 floors
export const UNITS_PER_FLOOR = 14

/**
 * Floor position mapping on facade image
 * All values are percentages of image dimensions
 *
 * top: Distance from top of image to top of floor band
 * height: Height of the clickable floor band
 * left/right: Horizontal bounds of the building on image
 *
 * NOTE: The facade is an aerial/perspective view, so floors
 * appear slightly different sizes. These are approximations.
 */
export const FLOOR_POSITIONS: Record<number, {
  top: number
  height: number
  left: number
  right: number
}> = {
  // Executive Suite Floors (17-25) - Golden windowed section
  // Cropped image: Building is more prominent and centered
  // 9 floors spanning from ~14% to ~54% (40% total, ~4.4% each)
  25: { top: 14.0, height: 4.4, left: 28, right: 72 },
  24: { top: 18.4, height: 4.4, left: 28, right: 72 },
  23: { top: 22.8, height: 4.4, left: 28, right: 72 },
  22: { top: 27.2, height: 4.4, left: 28, right: 72 },
  21: { top: 31.6, height: 4.4, left: 28, right: 72 },
  20: { top: 36.0, height: 4.4, left: 28, right: 72 },
  19: { top: 40.4, height: 4.4, left: 28, right: 72 },
  18: { top: 44.8, height: 4.4, left: 28, right: 72 },
  17: { top: 49.2, height: 4.4, left: 28, right: 72 },
}

/**
 * Building boundary on the facade image
 * Used for constraining zoom and calculating transforms
 */
export const BUILDING_BOUNDS = {
  // Where the Pullman building sits in the image (percentages)
  // Cropped image: Building is more prominent
  top: 8,       // Top of building (roof structures)
  bottom: 70,   // Base of building
  left: 25,     // Left edge
  right: 75,    // Right edge

  // Center point for zoom calculations
  centerX: 50,
  centerY: 35,
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
