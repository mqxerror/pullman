/**
 * BuildingFacadeSVG - Interactive building facade with floor selection
 *
 * SVG overlay on building image with polygon paths tracing each floor's windows.
 * Provides precise highlighting that follows actual window shapes.
 *
 * Image: pullman-building-v4.png (583 x 1172 pixels)
 */

import { cn } from '@/lib/utils'

interface BuildingFacadeSVGProps {
  selectedFloor: number | null
  hoveredFloor: number | null
  onFloorSelect: (floor: number) => void
  onFloorHover: (floor: number | null) => void
  className?: string
}

// Image dimensions
const IMAGE_WIDTH = 583
const IMAGE_HEIGHT = 1172

/**
 * Floor window polygon coordinates
 * Each floor has coordinates [x1,y1, x2,y2, ...] defining the window band shape
 * Coordinates are in pixels relative to the 583x1172 image
 *
 * IMPORTANT: Floors 17-27 are the UPPER portion of the tower only.
 * Floor 17 is NOT at the bottom - it's roughly in the middle of the windowed section.
 * Calibrated to match actual floor positions in the building.
 */
const FLOOR_POLYGONS: Record<number, string> = {
  // Floor 27 - Sky Bar (top penthouse level) - 26px height each
  27: '195,185 470,185 470,211 195,211',

  // Floor 26 - Rooftop Pool level
  26: '195,211 470,211 470,237 195,237',

  // Floor 25
  25: '195,237 470,237 470,263 195,263',

  // Floor 24
  24: '195,263 470,263 470,289 195,289',

  // Floor 23
  23: '195,289 470,289 470,315 195,315',

  // Floor 22
  22: '195,315 470,315 470,341 195,341',

  // Floor 21
  21: '195,341 470,341 470,367 195,367',

  // Floor 20
  20: '195,367 470,367 470,393 195,393',

  // Floor 19
  19: '195,393 470,393 470,419 195,419',

  // Floor 18
  18: '195,419 470,419 470,445 195,445',

  // Floor 17 - Lowest selectable floor (middle of tower)
  17: '195,445 470,445 470,471 195,471',
}

// Amenity floors (26=Pool, 27=Sky Bar)
const AMENITY_FLOORS = [26, 27]
const AMENITY_LABELS: Record<number, string> = {
  26: 'Rooftop Pool',
  27: 'Sky Bar & Lounge',
}

export default function BuildingFacadeSVG({
  selectedFloor,
  hoveredFloor,
  onFloorSelect,
  onFloorHover,
  className,
}: BuildingFacadeSVGProps) {
  const isAmenityFloor = (floor: number) => AMENITY_FLOORS.includes(floor)

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Building Image */}
      <img
        src="/assets/pullman-building-v4.png"
        alt="Pullman Hotel Panama"
        className="w-full h-full object-contain rounded-2xl shadow-2xl"
      />

      {/* SVG Overlay */}
      <svg
        viewBox={`0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}`}
        className="absolute inset-0 w-full h-full rounded-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle gold glow filter for selected floor */}
          <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor="#fcd34d" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle glow for hovered floor */}
          <filter id="hoverGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#fcd34d" floodOpacity="0.5" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Floor polygons */}
        {Object.entries(FLOOR_POLYGONS).map(([floorStr, points]) => {
          const floor = parseInt(floorStr)
          const isSelected = selectedFloor === floor
          const isHovered = hoveredFloor === floor
          const isAmenity = isAmenityFloor(floor)

          return (
            <g key={floor}>
              {/* Clickable polygon */}
              <polygon
                points={points}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  isSelected
                    ? 'fill-amber-300/35 stroke-amber-300 stroke-[1.5]'
                    : isHovered
                    ? 'fill-amber-200/25 stroke-amber-200 stroke-1'
                    : 'fill-transparent stroke-transparent hover:fill-white/10'
                )}
                style={{
                  filter: isSelected ? 'url(#goldGlow)' : isHovered ? 'url(#hoverGlow)' : 'none',
                }}
                onClick={() => onFloorSelect(floor)}
                onMouseEnter={() => onFloorHover(floor)}
                onMouseLeave={() => onFloorHover(null)}
              />

              {/* Floor number label (shown on hover/select) */}
              {(isSelected || isHovered) && (
                <text
                  x={IMAGE_WIDTH / 2}
                  y={getPolygonCenterY(points)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none font-bold fill-white"
                  style={{
                    fontSize: isSelected ? '18px' : '14px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                  }}
                >
                  {isAmenity ? AMENITY_LABELS[floor] : `Floor ${floor}`}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Helper to get vertical center of a polygon
function getPolygonCenterY(points: string): number {
  const coords = points.split(' ').map(p => {
    const [, y] = p.split(',').map(Number)
    return y
  })
  const minY = Math.min(...coords)
  const maxY = Math.max(...coords)
  return (minY + maxY) / 2
}
