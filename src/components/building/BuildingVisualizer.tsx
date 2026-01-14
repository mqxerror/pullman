import { useState, useCallback } from 'react'
import { motion, useAnimation, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite, FloorStats } from '@/types/database'
import {
  FLOOR_POSITIONS,
  MIN_FLOOR,
  MAX_FLOOR,
  ZOOM_CONFIG,
  getFloorArray,
} from '@/config/building'
import { projectConfig } from '@/config/project'
import { cn } from '@/lib/utils'
import FloorDetailPanel from './FloorDetailPanel'
import SuiteDetailModal from './SuiteDetailModal'

type View = 'building' | 'floor' | 'suite'

export default function BuildingVisualizer() {
  const [view, setView] = useState<View>('building')
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const controls = useAnimation()

  // Fetch all suites
  const { data: suites = [], isLoading } = useQuery({
    queryKey: ['pullman_suites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .order('floor', { ascending: false })
        .order('unit_number', { ascending: true })

      if (error) throw error
      return data as ExecutiveSuite[]
    },
  })

  // Calculate floor statistics
  const getFloorStats = useCallback((floor: number): FloorStats => {
    const floorSuites = suites.filter((s) => s.floor === floor)
    return {
      floor,
      total: floorSuites.length,
      available: floorSuites.filter((s) => s.status === 'available').length,
      reserved: floorSuites.filter((s) => s.status === 'reserved').length,
      sold: floorSuites.filter((s) => s.status === 'sold').length,
    }
  }, [suites])

  // Handle floor click with zoom animation
  const handleFloorClick = async (floor: number) => {
    const pos = FLOOR_POSITIONS[floor]
    if (!pos) return

    // Calculate zoom focus point
    const floorCenter = pos.top + (pos.height / 2)
    const yOffset = (50 - floorCenter) * (ZOOM_CONFIG.floorView - 1)

    // Animate zoom
    await controls.start({
      scale: ZOOM_CONFIG.floorView,
      y: `${yOffset}%`,
      transition: {
        duration: ZOOM_CONFIG.duration,
        ease: ZOOM_CONFIG.ease,
      },
    })

    setSelectedFloor(floor)
    setView('floor')
  }

  // Handle back navigation
  const handleBack = async () => {
    if (view === 'suite') {
      setSelectedSuite(null)
      setView('floor')
    } else if (view === 'floor') {
      // Reverse zoom animation
      await controls.start({
        scale: ZOOM_CONFIG.default,
        y: 0,
        transition: {
          duration: ZOOM_CONFIG.reverseDuration,
          ease: ZOOM_CONFIG.ease,
        },
      })
      setSelectedFloor(null)
      setView('building')
    }
  }

  // Handle suite selection
  const handleSuiteClick = (suite: ExecutiveSuite) => {
    setSelectedSuite(suite)
    setView('suite')
  }

  // Get suites for selected floor
  const floorSuites = selectedFloor
    ? suites.filter((s) => s.floor === selectedFloor)
    : []

  const floors = getFloorArray()
  const activeFloor = hoveredFloor || selectedFloor

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {view !== 'building' && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">
                {projectConfig.name}
              </h1>
              <p className="text-sm text-white/60">
                {view === 'building' && 'Select a floor to explore'}
                {view === 'floor' && `Floor ${selectedFloor} - Executive Suites`}
                {view === 'suite' && `Suite ${selectedSuite?.floor}-${selectedSuite?.unit_number}`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {suites.filter((s) => s.status === 'available').length}
              </p>
              <p className="text-xs text-white/60">Available</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-bold text-white">126</p>
              <p className="text-xs text-white/60">Total Suites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Building Visualization with Zoom */}
      <motion.div
        animate={controls}
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformOrigin: 'center center' }}
      >
        {/* Facade Image */}
        <div className="relative h-full max-h-[90vh] aspect-[3463/3896]">
          <img
            src={projectConfig.media.heroImage}
            alt={projectConfig.name}
            className="h-full w-full object-cover"
          />

          {/* Floor Hotspots Overlay */}
          {view === 'building' && (
            <div className="absolute inset-0">
              {floors.map((floor) => {
                const pos = FLOOR_POSITIONS[floor]
                const stats = getFloorStats(floor)
                const isHovered = hoveredFloor === floor

                return (
                  <button
                    key={floor}
                    onClick={() => handleFloorClick(floor)}
                    onMouseEnter={() => setHoveredFloor(floor)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    className="absolute transition-all duration-200 cursor-pointer group"
                    style={{
                      top: `${pos.top}%`,
                      left: `${pos.left}%`,
                      width: `${pos.right - pos.left}%`,
                      height: `${pos.height}%`,
                    }}
                    aria-label={`Floor ${floor}: ${stats.available} of ${stats.total} available`}
                  >
                    {/* Hover/Selected highlight */}
                    <div
                      className={cn(
                        'absolute inset-0 transition-all duration-200',
                        isHovered && 'bg-white/20 border-y-2 border-white/40'
                      )}
                    />

                    {/* Floor label on hover */}
                    {isHovered && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-slate-900 rounded-md text-sm font-bold shadow-lg">
                        {floor}
                      </div>
                    )}
                  </button>
                )
              })}

              {/* Tooltip for active floor */}
              {activeFloor && view === 'building' && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: `${FLOOR_POSITIONS[activeFloor].right + 2}%`,
                    top: `${FLOOR_POSITIONS[activeFloor].top}%`,
                  }}
                >
                  <div className="bg-slate-800 text-white rounded-xl shadow-xl px-4 py-3 min-w-[160px] border border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span className="text-lg font-bold">Floor {activeFloor}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>{getFloorStats(activeFloor).available} available</span>
                      </div>
                      {getFloorStats(activeFloor).reserved > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>{getFloorStats(activeFloor).reserved} reserved</span>
                        </div>
                      )}
                      {getFloorStats(activeFloor).sold > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>{getFloorStats(activeFloor).sold} sold</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-2 pt-2 border-t border-slate-700">
                      Click to explore
                    </p>
                    {/* Arrow */}
                    <div className="absolute left-0 top-4 w-2 h-2 bg-slate-800 transform -translate-x-1 rotate-45 border-l border-b border-slate-700" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Legend */}
          {view === 'building' && (
            <div className="absolute bottom-4 left-4 flex items-center gap-4 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs text-white">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs text-white">Limited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-xs text-white">Sold</span>
              </div>
            </div>
          )}

          {/* Floor range indicator */}
          {view === 'building' && (
            <div className="absolute bottom-4 right-4 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg">
              <p className="text-xs text-white/60">Executive Suites</p>
              <p className="text-sm font-bold text-white">
                Floors {MIN_FLOOR} - {MAX_FLOOR}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Floor Detail Panel (slides in from right) */}
      <AnimatePresence>
        {view === 'floor' && selectedFloor && (
          <FloorDetailPanel
            floor={selectedFloor}
            suites={floorSuites}
            onSuiteClick={handleSuiteClick}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>

      {/* Suite Detail Modal */}
      <AnimatePresence>
        {view === 'suite' && selectedSuite && (
          <SuiteDetailModal
            suite={selectedSuite}
            onClose={handleBack}
          />
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-400 border-t-transparent" />
            <p className="text-white/60">Loading suites...</p>
          </div>
        </div>
      )}
    </div>
  )
}
