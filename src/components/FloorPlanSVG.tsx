import { useState, useRef } from 'react'
import type { ExecutiveSuite } from '@/types/database'
import { Check, Clock, Lock } from 'lucide-react'

interface FloorPlanSVGProps {
  floor: number
  suites: ExecutiveSuite[]
  onSuiteClick: (suite: ExecutiveSuite) => void
  onSuiteLongPress?: (suite: ExecutiveSuite) => void
  selectedSuiteId?: string
  compareSuiteIds?: string[]
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

export default function FloorPlanSVG({ floor, suites, onSuiteClick, onSuiteLongPress, selectedSuiteId, compareSuiteIds = [] }: FloorPlanSVGProps) {
  const [hoveredSuite, setHoveredSuite] = useState<number | null>(null)
  const [pressedSuite, setPressedSuite] = useState<number | null>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showLongPressHint, setShowLongPressHint] = useState<number | null>(null)

  const getSuiteByUnit = (unitNumber: number) => {
    return suites.find((s) => s.unit_number === unitNumber)
  }

  // Long press duration in ms
  const LONG_PRESS_DURATION = 500

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
            <filter id="compareGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="#8B5CF6" floodOpacity="0.5"/>
            </filter>
          </defs>

          {/* Suite polygons */}
          {Object.entries(SUITE_PATHS).map(([unitStr, path]) => {
            const unitNumber = parseInt(unitStr)
            const suite = getSuiteByUnit(unitNumber)
            const isHovered = hoveredSuite === unitNumber
            const isPressed = pressedSuite === unitNumber
            const isSelected = suite?.id === selectedSuiteId
            const isComparing = suite && compareSuiteIds.includes(suite.id)
            const _showHint = showLongPressHint === unitNumber // Visual hint on long-press
            void _showHint
            const status = suite?.status || 'available'
            const config = statusConfig[status]
            // Pressed/active state takes priority for touch feedback
            const isActive = isPressed || isHovered

            const getFilter = () => {
              if (isComparing) return 'url(#compareGlow)'
              if (isSelected) return 'url(#selectedGlow)'
              if (isActive) {
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
                fill={isComparing ? 'rgba(139, 92, 246, 0.25)' : isSelected ? config.selectedFill : isActive ? config.hoverFill : config.fill}
                stroke={isComparing ? '#8B5CF6' : config.stroke}
                strokeWidth={isComparing ? 3 : isSelected ? 2.5 : isActive ? 2 : 1.5}
                strokeLinejoin="round"
                className="cursor-pointer transition-all duration-150 ease-out touch-manipulation select-none"
                style={{
                  vectorEffect: 'non-scaling-stroke',
                  opacity: status === 'sold' && !isActive && !isSelected ? 0.7 : 1,
                  // Scale effect on press for tactile feedback
                  transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                  transformOrigin: 'center',
                }}
                filter={getFilter()}
                onMouseEnter={() => setHoveredSuite(unitNumber)}
                onMouseLeave={() => setHoveredSuite(null)}
                // Touch events for mobile/tablet feedback with haptics + long press
                onTouchStart={() => {
                  setPressedSuite(unitNumber)
                  // Subtle haptic feedback on touch start
                  if (navigator.vibrate) {
                    navigator.vibrate(5)
                  }
                  // Start long press timer for compare mode
                  if (onSuiteLongPress && suite) {
                    longPressTimerRef.current = setTimeout(() => {
                      // Long press detected - add to compare
                      if (navigator.vibrate) {
                        navigator.vibrate([20, 50, 20])
                      }
                      setShowLongPressHint(unitNumber)
                      onSuiteLongPress(suite)
                      setPressedSuite(null)
                      setTimeout(() => setShowLongPressHint(null), 1000)
                    }, LONG_PRESS_DURATION)
                  }
                }}
                onTouchEnd={() => {
                  // Clear long press timer
                  if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current)
                    longPressTimerRef.current = null
                  }
                  // Only trigger click if not a long press
                  if (pressedSuite === unitNumber && suite) {
                    // Stronger haptic on selection
                    if (navigator.vibrate) {
                      navigator.vibrate(15)
                    }
                    onSuiteClick(suite)
                  }
                  setPressedSuite(null)
                }}
                onTouchCancel={() => {
                  if (longPressTimerRef.current) {
                    clearTimeout(longPressTimerRef.current)
                    longPressTimerRef.current = null
                  }
                  setPressedSuite(null)
                }}
                // Mouse events for desktop
                onMouseDown={() => setPressedSuite(unitNumber)}
                onMouseUp={() => setPressedSuite(null)}
                onClick={(e) => {
                  // Prevent double-firing on touch devices
                  if (e.detail === 0) return // Touch events handle this
                  if (!suite) return

                  // Shift+click or Ctrl+click to add to compare (desktop equivalent of long-press)
                  if ((e.shiftKey || e.ctrlKey) && onSuiteLongPress) {
                    e.preventDefault()
                    setShowLongPressHint(unitNumber)
                    onSuiteLongPress(suite)
                    setTimeout(() => setShowLongPressHint(null), 1000)
                    return
                  }

                  onSuiteClick(suite)
                }}
              />
            )
          })}
        </svg>

      </div>
    </div>
  )
}
