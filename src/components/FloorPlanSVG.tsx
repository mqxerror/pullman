import { useState } from 'react'
import type { ExecutiveSuite } from '@/types/database'
import { Check, Clock, Lock } from 'lucide-react'

interface FloorPlanSVGProps {
  floor: number
  suites: ExecutiveSuite[]
  onSuiteClick: (suite: ExecutiveSuite) => void
  selectedSuiteId?: string
}

// SVG paths in pixel coordinates matching pullman-plan.png (1188 x 1238 pixels)
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
}

// Status color configuration
const statusConfig = {
  available: {
    fill: 'rgba(76, 175, 119, 0.18)',
    stroke: '#2D8A5E',
    hoverFill: 'rgba(76, 175, 119, 0.35)',
    selectedFill: 'rgba(76, 175, 119, 0.45)',
    icon: Check,
  },
  reserved: {
    fill: 'rgba(212, 160, 0, 0.15)',
    stroke: '#D4A000',
    hoverFill: 'rgba(212, 160, 0, 0.30)',
    selectedFill: 'rgba(212, 160, 0, 0.40)',
    icon: Clock,
  },
  sold: {
    fill: 'rgba(180, 83, 83, 0.30)',
    stroke: '#9B4D4D',
    hoverFill: 'rgba(180, 83, 83, 0.42)',
    selectedFill: 'rgba(180, 83, 83, 0.52)',
    icon: Lock,
  },
}

export default function FloorPlanSVG({ floor, suites, onSuiteClick, selectedSuiteId }: FloorPlanSVGProps) {
  const [hoveredSuite, setHoveredSuite] = useState<number | null>(null)

  const getSuiteByUnit = (unitNumber: number) => {
    return suites.find((s) => s.unit_number === unitNumber)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Floor plan container - maintains aspect ratio for SVG alignment */}
      <div
        className="relative h-[90%] max-w-full"
        style={{ aspectRatio: '1188 / 1238' }}
      >
        {/* Clean Floor Plan Image */}
        <img
          src="/assets/floorplans/pullman-plan.png"
          alt={`Floor ${floor} Plan`}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* SVG Overlay - matches image dimensions for proper alignment */}
        <svg
          viewBox="0 0 1188 1238"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4A000" floodOpacity="0.4"/>
            </filter>
            <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#1E293B" floodOpacity="0.15"/>
            </filter>
            <filter id="availableGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2D8A5E" floodOpacity="0.25"/>
            </filter>
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
                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.5}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-200 ease-out touch-manipulation"
                style={{
                  vectorEffect: 'non-scaling-stroke',
                  opacity: status === 'sold' && !isHovered && !isSelected ? 0.7 : 1
                }}
                filter={getFilter()}
                onMouseEnter={() => setHoveredSuite(unitNumber)}
                onMouseLeave={() => setHoveredSuite(null)}
                onClick={() => suite && onSuiteClick(suite)}
              />
            )
          })}
        </svg>

        {/* Floor label */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gold-200">
          <div className="text-lg font-bold text-slate-900 heading-display">Floor {floor}</div>
          <div className="text-xs text-gold-600 font-medium">14 Luxury Suites</div>
        </div>
      </div>
    </div>
  )
}
