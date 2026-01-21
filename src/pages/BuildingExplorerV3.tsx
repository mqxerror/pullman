import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import { Menu, X, Maximize2, Check, Clock, Lock, X as CloseIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR, TOTAL_FLOORS, BUILDING_CONFIG } from '@/config/building'
import { cn } from '@/lib/utils'

// Interactive Tower Version - Building-centric with overlay panels

const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}


const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-green-500', bg: 'bg-green-500', bgLight: 'bg-green-50' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-gold-500', bg: 'bg-gold-500', bgLight: 'bg-gold-50' },
  sold: { icon: Lock, label: 'Sold', color: 'text-slate-400', bg: 'bg-slate-400', bgLight: 'bg-slate-100' },
}

export default function BuildingExplorerV3() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { data: apartments = [] } = useQuery({
    queryKey: ['pullman_suites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .order('floor', { ascending: true })
        .order('unit_number', { ascending: true })

      if (error) throw error
      return data as ExecutiveSuite[]
    },
  })

  const floorApartments = selectedFloor
    ? apartments.filter((apt) => apt.floor === selectedFloor)
    : []

  const getFloorStats = (floor: number) => {
    const floorApts = apartments.filter((apt) => apt.floor === floor)
    return {
      total: floorApts.length,
      available: floorApts.filter((a) => a.status === 'available').length,
      reserved: floorApts.filter((a) => a.status === 'reserved').length,
    }
  }

  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => {
    const floor = MAX_FLOOR - i
    const floorHeight = (BUILDING_CONFIG.bottom - BUILDING_CONFIG.top) / TOTAL_FLOORS
    return {
      floor,
      top: BUILDING_CONFIG.top + i * floorHeight,
      height: floorHeight,
      stats: getFloorStats(floor),
    }
  })

  const activeFloor = hoveredFloor || selectedFloor

  const handleFloorUp = () => {
    if (selectedFloor && selectedFloor < MAX_FLOOR) {
      setSelectedFloor(selectedFloor + 1)
    } else if (!selectedFloor) {
      setSelectedFloor(MIN_FLOOR)
    }
  }

  const handleFloorDown = () => {
    if (selectedFloor && selectedFloor > MIN_FLOOR) {
      setSelectedFloor(selectedFloor - 1)
    } else if (!selectedFloor) {
      setSelectedFloor(MAX_FLOOR)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-stone-50 to-slate-100">
      {/* Minimal Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-12 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/building-v2" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Gallery</Link>
            <Link to="/building-v3" className="text-sm text-slate-900 font-medium">Tower</Link>
            <Link to="/building" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Classic</Link>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Full-screen Building Experience */}
        <div className="h-[calc(100vh-73px)] flex items-center justify-center p-8">
          {/* Building Container */}
          <div className="relative h-full max-h-[800px] aspect-[3/4] mx-auto">
            {/* Building Image */}
            <img
              src="/assets/pullman-facade-v2.png"
              alt="Panama City Central Tower"
              className="h-full w-full object-cover rounded-3xl shadow-2xl"
            />

            {/* Floor Overlays */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              {floors.map((f) => {
                const isHovered = hoveredFloor === f.floor
                const isSelected = selectedFloor === f.floor

                return (
                  <button
                    key={f.floor}
                    onClick={() => setSelectedFloor(f.floor)}
                    onMouseEnter={() => setHoveredFloor(f.floor)}
                    onMouseLeave={() => setHoveredFloor(null)}
                    className="absolute transition-all duration-200"
                    style={{
                      top: `${f.top}%`,
                      left: `${BUILDING_CONFIG.left}%`,
                      width: `${BUILDING_CONFIG.right - BUILDING_CONFIG.left}%`,
                      height: `${f.height}%`,
                    }}
                  >
                    {/* Selected floor highlight */}
                    {isSelected && (
                      <div className="absolute inset-0 floor-highlight-band flex items-center justify-center">
                        <div className="floor-pill text-gold-700 text-sm font-bold px-4 py-1 rounded-lg shadow-lg">
                          Floor {f.floor}
                        </div>
                      </div>
                    )}

                    {/* Hover state */}
                    {isHovered && !isSelected && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] transition-all duration-150 border-y border-white/30" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Floating Floor Info Tooltip */}
            {activeFloor && (
              <div
                className="absolute z-20 pointer-events-none animate-fade-in"
                style={{
                  left: `${BUILDING_CONFIG.right + 3}%`,
                  top: `${floors.find((f) => f.floor === activeFloor)?.top || 0}%`,
                }}
              >
                <div className="bg-white rounded-2xl shadow-2xl px-5 py-4 min-w-[180px] border border-gold-200">
                  <div className="text-2xl font-bold text-slate-900 heading-display">Floor {activeFloor}</div>
                  <div className="divider-gold my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available</span>
                      <span className="font-semibold text-green-600">{getFloorStats(activeFloor).available}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Reserved</span>
                      <span className="font-semibold text-gold-600">{getFloorStats(activeFloor).reserved}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFloor(activeFloor)}
                    className="w-full mt-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors pointer-events-auto"
                  >
                    View Suites →
                  </button>
                  {/* Arrow */}
                  <div className="absolute left-0 top-8 w-3 h-3 bg-white transform -translate-x-1.5 rotate-45 border-l border-b border-gold-200" />
                </div>
              </div>
            )}

            {/* Floor Navigator - Bottom Left */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 border border-gold-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleFloorDown}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-gold-100 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <div className="text-center min-w-[60px]">
                  <div className="text-3xl font-bold text-primary tabular-nums">
                    {selectedFloor || '--'}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Floor</div>
                </div>
                <button
                  onClick={handleFloorUp}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-gold-100 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Legend - Bottom Right */}
            <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-xl shadow-lg px-4 py-3 border border-gold-200">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                  <span className="text-slate-600">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600">Sold</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suite Selection Panel - Slides up when floor is selected */}
        {selectedFloor && (
          <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up">
            <div className="bg-white rounded-t-3xl shadow-2xl border-t border-gold-200 max-h-[50vh] overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 flex items-center justify-between border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-bold heading-display">Floor {selectedFloor}</h2>
                  <p className="text-slate-500 text-sm">{floorApartments.length} suites · {getFloorStats(selectedFloor).available} available</p>
                </div>
                <button
                  onClick={() => setSelectedFloor(null)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Horizontal Suite Grid */}
              <div className="px-6 py-4 overflow-x-auto">
                <div className="flex gap-4">
                  {floorApartments.map((suite) => {
                    const config = statusConfig[suite.status]
                    const StatusIcon = config.icon

                    return (
                      <div
                        key={suite.id}
                        onClick={() => setSelectedSuite(suite)}
                        className={cn(
                          'flex-shrink-0 w-[240px] bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg',
                          suite.status === 'available' ? 'border-green-200 hover:border-green-400' :
                          suite.status === 'reserved' ? 'border-gold-200 hover:border-gold-400' :
                          'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-lg font-bold text-slate-900">
                              {selectedFloor}-{suite.unit_number}
                            </div>
                            <div className="text-xs text-gold-600">{getSuiteType(suite.size_sqm)}</div>
                          </div>
                          <span className={cn('flex items-center gap-1 text-xs font-medium', config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" />
                            {suite.size_sqm} m²
                          </span>
                        </div>

                        <button className={cn(
                          'w-full py-2 rounded-lg text-sm font-medium transition-colors',
                          suite.status === 'available'
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : suite.status === 'reserved'
                            ? 'bg-gold-500 text-white hover:bg-gold-600'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        )}>
                          {suite.status === 'sold' ? 'Sold' : 'View Details'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruction Overlay - Shows when no floor selected */}
        {!selectedFloor && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg border border-gold-200">
            <p className="text-sm text-slate-600">
              <span className="text-gold-600 font-medium">Click on a floor</span> to explore available suites
            </p>
          </div>
        )}
      </main>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t border-slate-200 py-4">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-xs">© 2024 Panama City Central</p>
          <p className="text-gold-500 text-xs mt-1">Version 3: Interactive Tower</p>
        </div>
      </footer>
    </div>
  )
}
