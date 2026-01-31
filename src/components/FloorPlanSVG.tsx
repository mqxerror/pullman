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

// SVG paths in pixel coordinates matching pullman-plan.png (1550 x 1586 pixels)
// Manually traced unit boundaries
const SUITE_PATHS: Record<number, string> = {
  1:  'M 327,32 L 329,166 L 354,164 L 354,231 L 307,231 L 309,293 L 415,282 L 410,357 L 617,356 L 615,282 L 663,279 L 638,265 L 640,35 Z',
  2:  'M 640,32 L 906,41 L 906,586 L 636,591 L 620,356 L 622,281 L 640,281 Z',
  3:  'M 910,34 L 1218,41 L 1216,167 L 1191,169 L 1194,234 L 1241,232 L 1241,295 L 1131,298 L 1131,359 L 908,357 L 908,32 Z',
  4:  'M 1223,35 L 1218,162 L 1198,167 L 1200,227 L 1241,232 L 1243,297 L 1218,298 L 1221,361 L 1503,361 L 1506,39 L 1223,35 Z',
  5:  'M 1218,363 L 1506,363 L 1501,708 L 1219,711 L 1218,361 Z',
  6:  'M 1214,710 L 1503,713 L 1503,1100 L 1216,1098 L 1212,708 Z',
  7:  'M 1216,1103 L 1505,1103 L 1499,1550 L 1209,1550 L 1214,1100 Z',
  8:  'M 1205,1271 L 1203,1549 L 910,1547 L 908,1127 L 1129,1125 L 1135,1264 L 1203,1269 Z',
  9:  'M 644,943 L 903,941 L 906,1500 L 642,1498 L 644,941 Z',
  10: 'M 413,1124 L 638,1124 L 636,1546 L 338,1548 L 343,1267 L 410,1269 L 412,1126 Z',
  11: 'M 336,1548 L 340,1272 L 325,1265 L 329,1101 L 38,1101 L 42,1548 L 332,1544 Z',
  12: 'M 325,1094 L 329,715 L 40,713 L 45,1094 L 322,1099 Z',
  13: 'M 42,363 L 329,361 L 332,710 L 43,705 L 43,363 Z',
  14: 'M 43,354 L 331,359 L 329,299 L 300,293 L 304,227 L 343,222 L 345,168 L 323,162 L 323,36 L 42,34 L 40,354 Z',
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
        style={{ aspectRatio: '1550 / 1586' }}
      >
        {/* Clean Floor Plan Image */}
        <img
          src="/assets/floorplans/pullman-plan.png"
          alt={`Floor ${floor} Plan`}
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* SVG Overlay - matches pullman-plan.png (1550x1586) */}
        <svg
          viewBox="0 0 1550 1586"
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
