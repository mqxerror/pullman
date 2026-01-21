import { cn } from '@/lib/utils'
import type { Apartment } from '@/types/database'

interface BuildingViewProps {
  apartments: Apartment[]
  selectedFloor: number | null
  onFloorClick: (floor: number) => void
}

// Building has floors 7-41 (35 residential floors)
const FLOORS = Array.from({ length: 35 }, (_, i) => 41 - i) // [41, 40, ..., 7]

export default function BuildingView({ apartments, selectedFloor, onFloorClick }: BuildingViewProps) {
  // Calculate floor status based on apartments
  const getFloorStatus = (floor: number) => {
    const floorApts = apartments.filter((apt) => apt.floor === floor)
    if (floorApts.length === 0) return 'empty'

    const available = floorApts.filter((a) => a.status === 'available').length
    const reserved = floorApts.filter((a) => a.status === 'reserved').length
    const sold = floorApts.filter((a) => a.status === 'sold').length

    // Return dominant status
    if (available === floorApts.length) return 'available'
    if (sold === floorApts.length) return 'sold'
    if (reserved > 0 || (available > 0 && sold > 0)) return 'mixed'
    return 'mixed'
  }

  const getFloorColor = (floor: number) => {
    const status = getFloorStatus(floor)
    switch (status) {
      case 'available':
        return 'fill-status-available'
      case 'sold':
        return 'fill-status-sold'
      case 'mixed':
        return 'fill-status-reserved'
      default:
        return 'fill-gray-300'
    }
  }

  return (
    <div className="h-full flex flex-col items-center">
      <h2 className="text-lg font-semibold text-primary mb-4">Select a Floor</h2>

      <div className="flex-1 w-full max-w-xs">
        <svg
          viewBox="0 0 200 700"
          className="w-full h-full"
          role="img"
          aria-label="Panama City Central building, 25 floors"
        >
          {/* Building base */}
          <rect x="30" y="660" width="140" height="30" fill="#1e3a5f" rx="2" />

          {/* Floors */}
          {FLOORS.map((floor, index) => {
            const y = 20 + index * 18
            const isSelected = selectedFloor === floor

            return (
              <g
                key={floor}
                role="button"
                tabIndex={0}
                aria-label={`Floor ${floor}`}
                aria-pressed={isSelected}
                onClick={() => onFloorClick(floor)}
                onKeyDown={(e) => e.key === 'Enter' && onFloorClick(floor)}
                className="cursor-pointer group"
              >
                {/* Floor rectangle */}
                <rect
                  x="35"
                  y={y}
                  width="130"
                  height="16"
                  rx="1"
                  className={cn(
                    'transition-all duration-200',
                    getFloorColor(floor),
                    isSelected && 'stroke-primary stroke-2',
                    !isSelected && 'group-hover:brightness-110'
                  )}
                />

                {/* Floor number */}
                <text
                  x="100"
                  y={y + 12}
                  textAnchor="middle"
                  className="text-[10px] fill-white font-medium pointer-events-none"
                >
                  {floor}
                </text>

                {/* Hover tooltip */}
                <title>Floor {floor}</title>
              </g>
            )
          })}

          {/* Building antenna/top */}
          <rect x="95" y="5" width="10" height="15" fill="#1e3a5f" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-status-available"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-status-reserved"></div>
          <span>Mixed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-status-sold"></div>
          <span>Sold</span>
        </div>
      </div>
    </div>
  )
}
