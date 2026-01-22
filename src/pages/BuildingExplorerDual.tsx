import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import { Menu, X, Maximize2, Building2, Check, Clock, Lock, ChevronUp, ChevronDown, X as CloseIcon, ArrowRight, Bed, Bath, Mountain } from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR, TOTAL_FLOORS, BUILDING_CONFIG } from '@/config/building'
import { cn } from '@/lib/utils'
import FloorPlanSVG from '@/components/FloorPlanSVG'
import { getSuiteType, getSuiteImage } from '@/config/suiteData'

// Dual View - Tower + Interactive SVG Floor Plan

const getFloorPlanImage = (unitNumber: number): string => {
  if (unitNumber === 1 || unitNumber === 3) return '/assets/floorplans/suite-1-3.png'
  if (unitNumber === 2 || unitNumber === 9) return '/assets/floorplans/suite-2-9.png'
  if (unitNumber === 4 || unitNumber === 14) return '/assets/floorplans/suite-4-14.png'
  if (unitNumber === 5 || unitNumber === 13) return '/assets/floorplans/suite-5-13.png'
  if (unitNumber === 6 || unitNumber === 12) return '/assets/floorplans/suite-6-12.png'
  if (unitNumber === 7 || unitNumber === 11) return '/assets/floorplans/suite-7-11.png'
  if (unitNumber === 8 || unitNumber === 10) return '/assets/floorplans/suite-8-10.png'
  return '/assets/floorplans/floor-overview.png'
}

const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-green-500', bg: 'bg-green-500', bgLight: 'bg-green-50' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-gold-500', bg: 'bg-gold-500', bgLight: 'bg-gold-50' },
  sold: { icon: Lock, label: 'Sold', color: 'text-slate-400', bg: 'bg-slate-400', bgLight: 'bg-slate-100' },
}

export default function BuildingExplorerDual() {
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
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

  const floorApartments = apartments.filter((apt) => apt.floor === selectedFloor)

  const getFloorStats = (floor: number) => {
    const floorApts = apartments.filter((apt) => apt.floor === floor)
    return {
      total: floorApts.length,
      available: floorApts.filter((a) => a.status === 'available').length,
      reserved: floorApts.filter((a) => a.status === 'reserved').length,
      sold: floorApts.filter((a) => a.status === 'sold').length,
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

  const handleFloorUp = () => {
    if (selectedFloor < MAX_FLOOR) {
      setSelectedFloor(selectedFloor + 1)
    }
  }

  const handleFloorDown = () => {
    if (selectedFloor > MIN_FLOOR) {
      setSelectedFloor(selectedFloor - 1)
    }
  }

  const activeFloor = hoveredFloor || selectedFloor

  // Handle modal close on Escape key
  const handleCloseModal = useCallback(() => {
    setSelectedSuite(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSuite) {
        handleCloseModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedSuite, handleCloseModal])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-12 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/building" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Classic</Link>
            <Link to="/building-v2" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Gallery</Link>
            <Link to="/building-v3" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Tower</Link>
            <Link to="/building-dual" className="text-sm text-slate-900 font-medium border-b-2 border-gold-500 pb-0.5">Dual View</Link>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT: Tower Building */}
        <div className="lg:w-[35%] p-6 flex flex-col border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50">
          <div className="mb-4">
            <h2 className="text-2xl font-bold heading-display text-slate-900">Select Floor</h2>
            <p className="text-sm text-gold-600 mt-1">Click on the building to choose a floor</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="relative h-full max-h-[600px] aspect-[3/4] w-full max-w-[400px]">
              {/* Building Image */}
              <img
                src="/assets/pullman-facade-v2.png"
                alt="Panama City Central Tower"
                className="h-full w-full object-cover rounded-2xl shadow-xl"
              />

              {/* Floor Overlays */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
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
                      {isSelected && (
                        <div className="absolute inset-0 floor-highlight-band flex items-center justify-center">
                          <div className="floor-pill text-gold-700 text-xs font-bold px-3 py-0.5 rounded-md shadow-lg">
                            {f.floor}
                          </div>
                        </div>
                      )}
                      {isHovered && !isSelected && (
                        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] transition-all duration-150 border-y border-white/30" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Floor Navigator */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-gold-200">
                <div className="flex items-center gap-2">
                  <button onClick={handleFloorDown} className="p-1.5 rounded-lg bg-slate-100 hover:bg-gold-100 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="text-center min-w-[45px]">
                    <div className="text-xl font-bold text-primary tabular-nums">{selectedFloor}</div>
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider">Floor</div>
                  </div>
                  <button onClick={handleFloorUp} className="p-1.5 rounded-lg bg-slate-100 hover:bg-gold-100 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floor tooltip */}
              {activeFloor && (
                <div
                  className="absolute z-20 pointer-events-none animate-fade-in"
                  style={{
                    right: '-10px',
                    top: `${floors.find((f) => f.floor === activeFloor)?.top || 0}%`,
                    transform: 'translateX(100%)'
                  }}
                >
                  <div className="bg-white rounded-xl shadow-xl px-3 py-2 min-w-[120px] border border-gold-200">
                    <div className="text-sm font-bold text-slate-900">Floor {activeFloor}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-green-600">{getFloorStats(activeFloor).available} avail</span>
                      <span className="text-gold-600">{getFloorStats(activeFloor).reserved} res</span>
                    </div>
                    <div className="absolute left-0 top-4 w-2 h-2 bg-white transform -translate-x-1 rotate-45 border-l border-b border-gold-200" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Interactive SVG Floor Plan */}
        <div className="lg:w-[65%] p-6 flex flex-col bg-white">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold heading-display text-slate-900">Floor {selectedFloor} Layout</h2>
              <p className="text-sm text-slate-500 mt-1">
                Click on any suite to view details • <span className="text-gold-600">18 executive suites per floor</span>
              </p>
            </div>
            {/* Refined Legend */}
            <div className="hidden md:flex items-center gap-6 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-emerald-100 border-2 border-emerald-500" />
                <span className="text-[13px] text-slate-600 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-amber-100 border-2 border-amber-500" />
                <span className="text-[13px] text-slate-600 font-medium">Reserved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-slate-100 border-2 border-slate-400" />
                <span className="text-[13px] text-slate-600 font-medium">Sold</span>
              </div>
            </div>
          </div>

          {/* SVG Floor Plan */}
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-4 min-h-[500px] overflow-hidden">
            <FloorPlanSVG
              floor={selectedFloor}
              suites={floorApartments}
              onSuiteClick={setSelectedSuite}
              selectedSuiteId={selectedSuite?.id}
            />
          </div>

          {/* Floor Stats Bar */}
          <div className="mt-4 p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg">
            <div className="flex items-center justify-around text-center">
              <div>
                <div className="text-2xl font-bold text-white">{floorApartments.length}</div>
                <div className="text-xs text-slate-400">Total Suites</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-green-400">{getFloorStats(selectedFloor).available}</div>
                <div className="text-xs text-slate-400">Available</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-gold-400">{getFloorStats(selectedFloor).reserved}</div>
                <div className="text-xs text-slate-400">Reserved</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <div className="text-2xl font-bold text-slate-400">{getFloorStats(selectedFloor).sold}</div>
                <div className="text-xs text-slate-400">Sold</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Suite Detail Modal */}
      {selectedSuite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Image */}
            <div className="relative h-72 overflow-hidden">
              <img
                src={getSuiteImage(selectedSuite.unit_number)}
                alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                aria-label="Close modal"
              >
                <CloseIcon className="w-5 h-5" />
              </button>

              {/* Suite Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm',
                        selectedSuite.status === 'available' ? 'bg-green-500/90 text-white' :
                        selectedSuite.status === 'reserved' ? 'bg-gold-500/90 text-white' :
                        'bg-slate-500/90 text-white'
                      )}>
                        {(() => {
                          const StatusIcon = statusConfig[selectedSuite.status].icon
                          return <StatusIcon className="w-4 h-4" />
                        })()}
                        {statusConfig[selectedSuite.status].label}
                      </span>
                    </div>
                    <h2 className="text-4xl font-bold text-white heading-display">
                      Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                    </h2>
                    <p className="text-gold-300 text-xl mt-1">{getSuiteType(selectedSuite.size_sqm)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white/70 text-sm">Starting from</div>
                    <div className="text-2xl font-bold text-white">Contact for Price</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Details */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 heading-display">Suite Details</h3>

                  {/* Key Features */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Maximize2 className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.size_sqm}</div>
                      <div className="text-xs text-slate-500">Square Meters</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Building2 className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.floor}</div>
                      <div className="text-xs text-slate-500">Floor Level</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <Mountain className="w-6 h-6 text-gold-500 mx-auto mb-2" />
                      <div className="text-xl font-bold text-slate-900">Ocean</div>
                      <div className="text-xs text-slate-500">View</div>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Bed className="w-4 h-4" /> Bedrooms
                      </span>
                      <span className="font-medium text-slate-900">1 Master Suite</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Bath className="w-4 h-4" /> Bathrooms
                      </span>
                      <span className="font-medium text-slate-900">1 Full Bath</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <span className="text-slate-500">Unit Number</span>
                      <span className="font-medium text-slate-900">{selectedSuite.unit_number}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-slate-500">Suite Type</span>
                      <span className="font-medium text-gold-600">{getSuiteType(selectedSuite.size_sqm)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Floor Plan */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 heading-display">Unit Floor Plan</h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <img
                      src={getFloorPlanImage(selectedSuite.unit_number)}
                      alt={`Suite ${selectedSuite.unit_number} Floor Plan`}
                      className="w-full h-auto rounded-lg floorplan-reveal"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/floorplans/floor-overview.png'
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Floor plan shown is representative. Actual layout may vary.
                  </p>
                </div>
              </div>

              {/* CTA */}
              {selectedSuite.status !== 'sold' && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors flex items-center justify-center gap-2 shadow-lg">
                      {selectedSuite.status === 'available' ? 'Request Information' : 'Join Waitlist'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button className="flex-1 py-4 bg-white border-2 border-gold-500 text-gold-600 font-medium rounded-xl hover:bg-gold-50 transition-colors">
                      Schedule a Tour
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs">© 2024 Panama City Central</p>
          <p className="text-gold-500 text-xs mt-1">Dual View: Tower Navigation + Interactive SVG Floor Plan</p>
        </div>
      </footer>
    </div>
  )
}
