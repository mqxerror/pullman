import { useState, useRef } from 'react'
import type { ExecutiveSuite } from '@/types/database'
import { cn } from '@/lib/utils'
import { Check, Clock, Lock, Maximize2 } from 'lucide-react'

interface FloorPlanSVGProps {
  floor: number
  suites: ExecutiveSuite[]
  onSuiteClick: (suite: ExecutiveSuite) => void
  selectedSuiteId?: string
}

// Suite metadata with sizes (from the floor plan - 18 suites)
const SUITE_DATA: Record<number, { size: number; type: string }> = {
  1: { size: 85.15, type: 'Premium Suite' },
  2: { size: 53.35, type: 'Executive Suite' },
  3: { size: 54.30, type: 'Executive Suite' },
  4: { size: 56.80, type: 'Executive Suite' },
  5: { size: 63.80, type: 'Deluxe Suite' },
  6: { size: 74.46, type: 'Deluxe Suite' },
  7: { size: 65.55, type: 'Deluxe Suite' },
  8: { size: 64.53, type: 'Deluxe Suite' },
  9: { size: 82.25, type: 'Premium Suite' },
  10: { size: 64.53, type: 'Deluxe Suite' },
  11: { size: 65.55, type: 'Deluxe Suite' },
  12: { size: 74.46, type: 'Deluxe Suite' },
  13: { size: 63.80, type: 'Deluxe Suite' },
  14: { size: 56.80, type: 'Executive Suite' },
  15: { size: 54.30, type: 'Executive Suite' },
  16: { size: 53.35, type: 'Executive Suite' },
  17: { size: 85.15, type: 'Premium Suite' },
  18: { size: 53.53, type: 'Executive Suite' },
}

// SVG paths in pixel coordinates matching pullman-plan.png (1188 x 1238 pixels)
// Using actual image dimensions for proper alignment
const SUITE_PATHS: Record<number, string> = {
  1: 'M 241,19 L 486,20 L 481,267 L 484,274 L 310,277 L 308,175 L 244,173 Z',
  2: 'M 13,22 L 236,22 L 234,262 L 173,265 L 172,207 L 10,210 Z',
  3: 'M 13,213 L 165,218 L 170,266 L 238,266 L 236,418 L 13,418 Z',
  4: 'M 7,421 L 238,418 L 236,587 L 172,587 L 170,621 L 10,624 Z',
  5: 'M 6,628 L 169,625 L 173,589 L 236,593 L 238,816 L 10,817 Z',
  6: 'M 11,824 L 236,828 L 236,1008 L 10,1010 Z',
  7: 'M 10,1015 L 238,1012 L 240,1226 L 10,1228 Z',
  8: 'M 244,1092 L 246,1226 L 484,1228 L 490,890 L 305,888 L 307,1092 L 248,1090 Z',
  9: 'M 492,1192 L 700,1188 L 697,744 L 490,742 Z',
  10: 'M 703,1229 L 947,1224 L 952,1091 L 884,1093 L 883,893 L 703,890 Z',
  11: 'M 952,1227 L 1179,1227 L 1176,1011 L 956,1016 Z',
  12: 'M 948,830 L 1180,830 L 1174,1006 L 958,1015 Z',
  13: 'M 952,820 L 1179,816 L 1179,629 L 1016,626 L 1016,589 L 950,589 Z',
  14: 'M 953,585 L 1015,586 L 1019,621 L 1179,620 L 1175,418 L 952,421 Z',
  15: 'M 952,414 L 1179,412 L 1179,213 L 1018,212 L 1016,262 L 958,265 Z',
  16: 'M 952,19 L 1179,22 L 1176,204 L 1015,209 L 1013,258 L 956,258 Z',
  17: 'M 705,19 L 945,24 L 943,173 L 880,173 L 880,279 L 703,279 Z',
  18: 'M 490,16 L 696,22 L 700,461 L 490,462 Z',
}

// Sophisticated hotel-appropriate color palette
const statusConfig = {
  available: {
    fill: 'rgba(76, 175, 119, 0.18)',      // Soft sage green
    stroke: '#2D8A5E',                      // Deep forest
    hoverFill: 'rgba(76, 175, 119, 0.35)',
    selectedFill: 'rgba(76, 175, 119, 0.45)',
    icon: Check,
    label: 'Available',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  reserved: {
    fill: 'rgba(212, 160, 0, 0.15)',        // Warm champagne
    stroke: '#D4A000',                       // Gold accent
    hoverFill: 'rgba(212, 160, 0, 0.30)',
    selectedFill: 'rgba(212, 160, 0, 0.40)',
    icon: Clock,
    label: 'Reserved',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  sold: {
    fill: 'rgba(180, 83, 83, 0.30)',         // Soft burgundy/rose
    stroke: '#9B4D4D',                        // Muted burgundy
    hoverFill: 'rgba(180, 83, 83, 0.42)',
    selectedFill: 'rgba(180, 83, 83, 0.52)',
    icon: Lock,
    label: 'Sold',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-600',
    badgeBorder: 'border-red-200',
  },
}

export default function FloorPlanSVG({ floor, suites, onSuiteClick, selectedSuiteId }: FloorPlanSVGProps) {
  const [hoveredSuite, setHoveredSuite] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const getSuiteByUnit = (unitNumber: number) => {
    return suites.find((s) => s.unit_number === unitNumber)
  }

  const handleMouseMove = (e: React.MouseEvent, unitNumber: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 10
      })
    }
    setHoveredSuite(unitNumber)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      {/* Floor plan container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Clean Floor Plan Image */}
        <div className="relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <img
            src="/assets/floorplans/pullman-plan.png"
            alt={`Floor ${floor} Plan`}
            className="max-w-full max-h-full object-contain"
          />

          {/* SVG Overlay - matches image dimensions for proper alignment */}
          <svg
            viewBox="0 0 1188 1238"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full"
          >
            <defs>
              {/* Refined glow effect for selected suites */}
              <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4A000" floodOpacity="0.4"/>
              </filter>

              {/* Subtle shadow for hover state */}
              <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1E293B" floodOpacity="0.15"/>
              </filter>

              {/* Available suite hover glow */}
              <filter id="availableGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2D8A5E" floodOpacity="0.25"/>
              </filter>

              {/* Reserved suite hover glow */}
              <filter id="reservedGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#D4A000" floodOpacity="0.25"/>
              </filter>
            </defs>

            {/* Suite polygons */}
            {Object.entries(SUITE_PATHS).map(([unitStr, path]) => {
              const unitNumber = parseInt(unitStr)
              const suite = getSuiteByUnit(unitNumber)
              const isHovered = hoveredSuite === unitNumber
              const isSelected = suite?.id === selectedSuiteId
              const status = suite?.status || 'available'
              const config = statusConfig[status]

              // Determine the appropriate filter based on status and state
              const getFilter = () => {
                if (isSelected) return 'url(#selectedGlow)'
                if (isHovered) {
                  if (status === 'available') return 'url(#availableGlow)'
                  if (status === 'reserved') return 'url(#reservedGlow)'
                  return 'url(#hoverGlow)'
                }
                return undefined
              }

              return (
                <path
                  key={unitNumber}
                  d={path}
                  fill={isSelected ? config.selectedFill : isHovered ? config.hoverFill : config.fill}
                  stroke={config.stroke}
                  strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 1}
                  strokeLinejoin="round"
                  className="cursor-pointer transition-all duration-200 ease-out"
                  style={{
                    vectorEffect: 'non-scaling-stroke',
                    opacity: status === 'sold' && !isHovered && !isSelected ? 0.7 : 1
                  }}
                  filter={getFilter()}
                  onMouseEnter={(e) => handleMouseMove(e, unitNumber)}
                  onMouseMove={(e) => handleMouseMove(e, unitNumber)}
                  onMouseLeave={() => {
                    setHoveredSuite(null)
                    setTooltipPos(null)
                  }}
                  onClick={() => suite && onSuiteClick(suite)}
                />
              )
            })}
          </svg>
        </div>

        {/* Floor label */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-gold-200">
          <div className="text-xl font-bold text-slate-900 heading-display">Floor {floor}</div>
          <div className="text-sm text-gold-600 font-medium">18 Executive Suites</div>
        </div>
      </div>

      {/* Floating Tooltip - Refined Design */}
      {hoveredSuite && tooltipPos && (
        <div
          className="absolute z-50 pointer-events-none animate-fade-in"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {(() => {
            const suite = getSuiteByUnit(hoveredSuite)
            const suiteInfo = SUITE_DATA[hoveredSuite]
            const status = suite?.status || 'available'
            const config = statusConfig[status]
            const StatusIcon = config.icon

            return (
              <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] px-5 py-4 min-w-[220px] border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">
                    Suite {floor}-{hoveredSuite}
                  </span>
                  <span className={cn(
                    'flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide border',
                    config.badgeBg,
                    config.badgeText,
                    config.badgeBorder
                  )}>
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                </div>

                {/* Suite Type */}
                <div className="text-sm text-slate-500 mb-3">{suiteInfo?.type || 'Suite'}</div>

                {/* Size */}
                <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">
                  <Maximize2 className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{suiteInfo?.size || '--'} m²</span>
                </div>

                {/* CTA */}
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 text-center">
                  Click to view full details →
                </div>

                {/* Arrow pointer */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-white border-r border-b border-slate-200 transform rotate-45 -mt-1.5" />
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
