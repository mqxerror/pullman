import { motion } from 'framer-motion'
import type { ExecutiveSuite } from '@/types/database'
import { cn } from '@/lib/utils'

interface FloorPlanInteractiveProps {
  floor: number
  suites: ExecutiveSuite[]
  onSuiteClick: (suite: ExecutiveSuite) => void
  selectedUnitId?: string
}

// Unit positions based on actual floor plan layout (percentages)
// Layout: Units arranged around central elevator core
const UNIT_POSITIONS: Record<number, { x: number; y: number; width: number; height: number }> = {
  // Top row (left to right)
  1:  { x: 8,  y: 5,  width: 18, height: 22 },
  2:  { x: 28, y: 5,  width: 22, height: 22 },
  3:  { x: 52, y: 5,  width: 18, height: 22 },
  // Right side (top to bottom)
  4:  { x: 72, y: 5,  width: 20, height: 18 },
  5:  { x: 72, y: 25, width: 20, height: 18 },
  6:  { x: 72, y: 55, width: 20, height: 18 },
  7:  { x: 72, y: 75, width: 20, height: 20 },
  // Bottom row (right to left)
  8:  { x: 52, y: 75, width: 18, height: 20 },
  9:  { x: 28, y: 75, width: 22, height: 20 },
  10: { x: 8,  y: 75, width: 18, height: 20 },
  // Left side (bottom to top)
  11: { x: 0,  y: 55, width: 20, height: 18 },
  12: { x: 0,  y: 37, width: 20, height: 16 },
  13: { x: 0,  y: 25, width: 20, height: 12 },
  14: { x: 0,  y: 5,  width: 20, height: 18 },
}

export default function FloorPlanInteractive({
  floor,
  suites,
  onSuiteClick,
  selectedUnitId,
}: FloorPlanInteractiveProps) {
  // Get suite by unit number
  const getSuiteByUnit = (unitNumber: number): ExecutiveSuite | undefined => {
    return suites.find((s) => s.unit_number === unitNumber)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return {
          fill: 'fill-emerald-500/30',
          stroke: 'stroke-emerald-400',
          text: 'text-emerald-400',
          hover: 'hover:fill-emerald-500/50',
        }
      case 'reserved':
        return {
          fill: 'fill-amber-500/30',
          stroke: 'stroke-amber-400',
          text: 'text-amber-400',
          hover: 'hover:fill-amber-500/50',
        }
      case 'sold':
        return {
          fill: 'fill-slate-500/30',
          stroke: 'stroke-slate-500',
          text: 'text-slate-500',
          hover: '',
        }
      default:
        return {
          fill: 'fill-slate-700/50',
          stroke: 'stroke-slate-600',
          text: 'text-slate-500',
          hover: 'hover:fill-slate-600/50',
        }
    }
  }

  return (
    <div className="relative w-full aspect-square bg-slate-800/50 rounded-xl p-4">
      {/* Floor Plan Title */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
          Floor {floor} Plan
        </span>
      </div>

      {/* SVG Floor Plan */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Central Core (Elevators/Services) */}
        <rect
          x="28"
          y="30"
          width="44"
          height="40"
          className="fill-slate-700/50 stroke-slate-600"
          strokeWidth="0.5"
          rx="2"
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-slate-500 text-[4px] font-medium"
        >
          ELEVATORS
        </text>
        <text
          x="50"
          y="54"
          textAnchor="middle"
          className="fill-slate-500 text-[3px]"
        >
          & SERVICES
        </text>

        {/* Unit Rectangles */}
        {Object.entries(UNIT_POSITIONS).map(([unitNum, pos]) => {
          const suite = getSuiteByUnit(Number(unitNum))
          const colors = getStatusColor(suite?.status || 'empty')
          const isSelected = suite?.id === selectedUnitId
          const isClickable = suite && suite.status !== 'sold'

          return (
            <motion.g
              key={unitNum}
              onClick={() => suite && isClickable && onSuiteClick(suite)}
              className={cn(
                'cursor-pointer transition-all',
                !isClickable && 'cursor-not-allowed'
              )}
              whileHover={isClickable ? { scale: 1.02 } : {}}
              whileTap={isClickable ? { scale: 0.98 } : {}}
            >
              {/* Unit Rectangle */}
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.width}
                height={pos.height}
                className={cn(
                  colors.fill,
                  colors.stroke,
                  colors.hover,
                  'transition-all duration-200',
                  isSelected && 'stroke-amber-400 stroke-2'
                )}
                strokeWidth={isSelected ? 1.5 : 0.5}
                rx="1"
              />

              {/* Unit Number */}
              <text
                x={pos.x + pos.width / 2}
                y={pos.y + pos.height / 2 - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className={cn('font-bold text-[5px]', colors.text)}
              >
                {unitNum}
              </text>

              {/* Size */}
              {suite && (
                <text
                  x={pos.x + pos.width / 2}
                  y={pos.y + pos.height / 2 + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-400 text-[3px]"
                >
                  {suite.size_sqm}m²
                </text>
              )}
            </motion.g>
          )
        })}

        {/* Compass */}
        <g transform="translate(90, 90)">
          <circle r="5" className="fill-slate-800 stroke-slate-600" strokeWidth="0.3" />
          <text
            y="-1"
            textAnchor="middle"
            className="fill-amber-400 text-[3px] font-bold"
          >
            N
          </text>
          <line x1="0" y1="1" x2="0" y2="3" className="stroke-slate-500" strokeWidth="0.3" />
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex gap-3 bg-slate-900/80 px-2 py-1 rounded text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-emerald-500/50 border border-emerald-400" />
          <span className="text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-amber-500/50 border border-amber-400" />
          <span className="text-slate-400">Reserved</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-sm bg-slate-500/50 border border-slate-500" />
          <span className="text-slate-400">Sold</span>
        </div>
      </div>
    </div>
  )
}
