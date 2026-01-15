import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import {
  Menu, X, Maximize2, Building2, Check, Clock, Lock, ChevronUp, ChevronDown,
  X as CloseIcon, ArrowRight, Bed, Bath, Mountain, Download, Share2, Phone,
  ChevronLeft, ChevronRight, Sparkles, Star, Wifi, Car, Dumbbell, Coffee, Shield, Waves,
  PanelLeftClose, PanelLeftOpen, Home, MapPin
} from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR } from '@/config/building'
import { cn } from '@/lib/utils'
import FloorPlanSVG from '@/components/FloorPlanSVG'

// A/B Test Variants
type ViewMode = 'A' | 'B' | 'C'

const BUILDING_CONFIG = {
  top: 14,
  bottom: 50,
  left: 20,
  right: 80,
}

const TOTAL_FLOORS = MAX_FLOOR - MIN_FLOOR + 1

const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

const getSuiteImage = (unitNumber: number): string => {
  const images = [
    '/assets/gallery/suite-type-07.jpg',
    '/assets/gallery/suite-type-08.jpg',
  ]
  return images[unitNumber % 2]
}

const getSuiteImages = (unitNumber: number): string[] => {
  return [
    '/assets/gallery/suite-type-07.jpg',
    '/assets/gallery/suite-type-08.jpg',
    '/assets/gallery/suite-interior-1.jpg',
  ]
}

const getFloorPlanImage = (unitNumber: number): string => {
  if (unitNumber === 1 || unitNumber === 3 || unitNumber === 15 || unitNumber === 17) return '/assets/floorplans/suite-1-3.png'
  if (unitNumber === 2 || unitNumber === 9 || unitNumber === 16 || unitNumber === 18) return '/assets/floorplans/suite-2-9.png'
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

const SUITE_FEATURES = [
  { icon: Maximize2, label: 'Floor-to-Ceiling Windows' },
  { icon: Sparkles, label: 'Central Air Conditioning' },
  { icon: Wifi, label: 'Smart Home Ready' },
]

const HOTEL_AMENITIES = [
  { icon: Coffee, label: '24/7 Room Service' },
  { icon: Waves, label: 'Rooftop Pool Access' },
  { icon: Star, label: 'Casino Access' },
  { icon: Shield, label: '24/7 Security' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Car, label: 'Valet Parking' },
]

export default function BuildingExplorerDualAB() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('A')
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'views' | 'floorplan'>('interior')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)

  const { data: apartments = [], isLoading } = useQuery({
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
    if (selectedFloor < MAX_FLOOR) setSelectedFloor(selectedFloor + 1)
  }

  const handleFloorDown = () => {
    if (selectedFloor > MIN_FLOOR) setSelectedFloor(selectedFloor - 1)
  }

  const activeFloor = hoveredFloor || selectedFloor

  const handleClosePanel = useCallback(() => {
    setSelectedSuite(null)
  }, [])

  const handleSuiteClick = (suite: ExecutiveSuite) => {
    if (viewMode === 'B') {
      // Option B: Navigate to full page
      navigate(`/suite/${suite.floor}/${suite.unit_number}`, { state: { suite } })
    } else {
      setSelectedSuite(suite)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSuite) {
        handleClosePanel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedSuite, handleClosePanel])

  // Get similar suites
  const similarSuites = apartments
    .filter(apt =>
      apt.id !== selectedSuite?.id &&
      apt.status === 'available' &&
      Math.abs(apt.size_sqm - (selectedSuite?.size_sqm || 0)) < 15
    )
    .slice(0, 4)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100">
      {/* Header - Enhanced with Breadcrumbs */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          {/* Top Row: Logo + A/B Toggle + Nav */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-10 lg:h-12 w-auto" />
              </Link>

              {/* Breadcrumb Navigation */}
              <nav className="hidden md:flex items-center gap-2 text-sm ml-4 pl-4 border-l border-slate-200">
                <Link to="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors">
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <span className="text-slate-900 font-medium">Floor {selectedFloor}</span>
                {selectedSuite && (
                  <>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-amber-600 font-medium">Suite {selectedSuite.floor}-{selectedSuite.unit_number}</span>
                  </>
                )}
              </nav>
            </div>

            {/* A/B Test Toggle - Enhanced touch targets */}
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => { setViewMode('A'); setSelectedSuite(null); }}
                className={cn(
                  'px-3 lg:px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all',
                  viewMode === 'A' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                )}
              >
                A: Panel
              </button>
              <button
                onClick={() => { setViewMode('B'); setSelectedSuite(null); }}
                className={cn(
                  'px-3 lg:px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all',
                  viewMode === 'B' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                )}
              >
                B: Page
              </button>
              <button
                onClick={() => { setViewMode('C'); setSelectedSuite(null); }}
                className={cn(
                  'px-3 lg:px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all',
                  viewMode === 'C' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                )}
              >
                C: Modal
              </button>
            </div>

            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/building-dual" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Original</Link>
              <span className="text-sm text-slate-900 font-medium border-b-2 border-amber-500 pb-0.5">A/B Test</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* LEFT: Collapsible Tower Building Panel */}
        <div
          className={cn(
            "flex flex-col border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 ease-out",
            leftPanelCollapsed
              ? "lg:w-[80px] p-3"
              : "lg:w-[35%] p-6"
          )}
        >
          {/* Panel Header with Collapse Toggle */}
          <div className={cn(
            "mb-4 flex items-center justify-between",
            leftPanelCollapsed && "flex-col gap-3"
          )}>
            {!leftPanelCollapsed && (
              <div>
                <h2 className="text-2xl font-bold heading-display text-slate-900">Select Floor</h2>
                <p className="text-sm text-gold-600 mt-1">Click on the building to choose a floor</p>
              </div>
            )}

            {/* Collapse Toggle Button - 44px touch target */}
            <button
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-slate-100 hover:bg-amber-100 transition-all flex items-center justify-center group"
              aria-label={leftPanelCollapsed ? "Expand panel" : "Collapse panel"}
            >
              {leftPanelCollapsed ? (
                <PanelLeftOpen className="w-5 h-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-slate-600 group-hover:text-amber-600 transition-colors" />
              )}
            </button>
          </div>

          {/* Collapsed State: Compact Floor Selector */}
          {leftPanelCollapsed ? (
            <div className="flex flex-col items-center gap-3 flex-1">
              {/* Vertical Floor Navigator */}
              <div className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-md p-2 border border-slate-200">
                <button
                  onClick={handleFloorUp}
                  className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-slate-50 hover:bg-amber-100 transition-colors flex items-center justify-center"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <div className="text-center py-2">
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">{selectedFloor}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Floor</div>
                </div>
                <button
                  onClick={handleFloorDown}
                  className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-slate-50 hover:bg-amber-100 transition-colors flex items-center justify-center"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Floor Stats Mini */}
              <div className="flex flex-col gap-1.5 text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-slate-600">{getFloorStats(selectedFloor).available}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-600">{getFloorStats(selectedFloor).reserved}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded State: Full Building View */
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
              <div className="relative h-full max-h-[750px] aspect-[2/5] w-full max-w-[320px]">
                <img
                  src="/assets/pullman-facade.png"
                  alt="Pullman Hotel & Casino Tower"
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
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[95%] floor-highlight-band flex items-center justify-center">
                            <div className="floor-pill text-gold-700 text-xs font-bold px-3 py-0.5 rounded-md shadow-lg">
                              {f.floor}
                            </div>
                          </div>
                        )}
                        {isHovered && !isSelected && (
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[95%] bg-white/20 backdrop-blur-[2px] transition-all duration-150 rounded-sm border border-white/30" />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Floor Navigator */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 border border-gold-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFloorDown}
                      className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-slate-100 hover:bg-amber-100 transition-colors flex items-center justify-center"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="text-center min-w-[45px]">
                      <div className="text-xl font-bold text-primary tabular-nums">{selectedFloor}</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wider">Floor</div>
                    </div>
                    <button
                      onClick={handleFloorUp}
                      className="p-2 min-w-[40px] min-h-[40px] rounded-lg bg-slate-100 hover:bg-amber-100 transition-colors flex items-center justify-center"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Floor tooltip */}
                {activeFloor && !selectedSuite && (
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
          )}
        </div>

        {/* MIDDLE: Floor Plan - Expands when left panel collapses */}
        <div className={cn(
          "p-6 flex flex-col bg-white transition-all duration-300 ease-out",
          leftPanelCollapsed ? "lg:flex-1" : "lg:w-[65%]"
        )}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold heading-display text-slate-900">Floor {selectedFloor} Layout</h2>
              <p className="text-sm text-slate-500 mt-1">
                Click on any suite to view details
              </p>
            </div>
            {/* Legend - always visible */}
            <div className="hidden md:flex items-center gap-6 px-5 py-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-[4px] bg-green-100 border-2 border-green-500" />
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
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-4 min-h-[400px] overflow-hidden">
            <FloorPlanSVG
              floor={selectedFloor}
              suites={floorApartments}
              onSuiteClick={handleSuiteClick}
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
                <div className="text-2xl font-bold text-amber-400">{getFloorStats(selectedFloor).reserved}</div>
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

        {/* OPTION A: Overlay Slide-in Panel - UX Enhanced */}
        {viewMode === 'A' && selectedSuite && (
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
              onClick={handleClosePanel}
            />

            {/* Slide Panel - Fixed position overlay */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] lg:w-[440px] bg-white shadow-2xl z-50 overflow-hidden animate-slide-in-right flex flex-col">
              {/* Sticky Header - Enhanced with X button */}
              <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <button
                  onClick={handleClosePanel}
                  className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Back</span>
                </button>

                {/* Status Badge - Unified colors */}
                <span className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
                  selectedSuite.status === 'available'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : selectedSuite.status === 'reserved'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                )}>
                  {(() => {
                    const StatusIcon = statusConfig[selectedSuite.status].icon
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  {statusConfig[selectedSuite.status].label}
                </span>

                {/* X Close Button */}
                <button
                  onClick={handleClosePanel}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {/* Hero Image Section */}
                <div className="relative">
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={activeImageTab === 'floorplan'
                        ? getFloorPlanImage(selectedSuite.unit_number)
                        : activeImageTab === 'views'
                        ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
                        : getSuiteImages(selectedSuite.unit_number)[0]}
                      alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number} ${activeImageTab}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Image Navigation Arrows - Enhanced touch targets */}
                    {activeImageTab !== 'floorplan' && (
                      <>
                        <button
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/95 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
                          aria-label="Next image"
                        >
                          <ArrowRight className="w-5 h-5 text-slate-700" />
                        </button>
                      </>
                    )}

                    {/* Suite Title Overlay - Better typography */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white heading-display">
                        Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                      </h2>
                      <p className="text-amber-200 text-base sm:text-lg mt-1 font-medium">
                        {getSuiteType(selectedSuite.size_sqm)}
                      </p>
                    </div>

                    {/* Image Counter */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-full">
                      1 / 3
                    </div>
                  </div>

                  {/* Image Tabs - Enhanced touch targets (44px min) */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {['interior', 'views', 'floorplan'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveImageTab(tab as any)}
                        className={cn(
                          'px-4 py-2.5 min-h-[44px] rounded-full text-sm font-semibold transition-all capitalize',
                          activeImageTab === tab
                            ? 'bg-white text-slate-900 shadow-md'
                            : 'bg-black/40 backdrop-blur text-white hover:bg-black/60'
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {activeImageTab !== 'floorplan' && (
                  <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-100">
                    {getSuiteImages(selectedSuite.unit_number).map((img, idx) => (
                      <button
                        key={idx}
                        className={cn(
                          'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                          idx === 0 ? 'border-amber-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Panel Content */}
                <div className="p-5">
                  {/* Quick Stats - Consistent typography */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                      <Maximize2 className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                      <div className="text-xl font-bold text-slate-900 heading-display">{selectedSuite.size_sqm}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">m²</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                      <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                      <div className="text-xl font-bold text-slate-900 heading-display">{selectedSuite.floor}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Floor</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                      <Mountain className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                      <div className="text-xl font-bold text-slate-900 heading-display">Ocean</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">View</div>
                    </div>
                  </div>

                  {/* Price Card - Cleaner */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 mb-5 shadow-lg">
                    <div className="text-slate-400 text-sm font-medium">Starting from</div>
                    <div className="text-2xl font-bold text-white mt-1 heading-display">Contact for Pricing</div>
                    <div className="text-amber-400 text-sm mt-2 font-medium">Flexible payment plans available</div>
                  </div>

                  {/* Features & Amenities - Unified check color */}
                  <div className="space-y-4 mb-5">
                    {/* Suite Features */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Suite Features
                      </h3>
                      <div className="grid grid-cols-1 gap-2">
                        {SUITE_FEATURES.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-slate-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{feature.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hotel Amenities */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Hotel Amenities
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {HOTEL_AMENITIES.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 text-slate-700">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">{amenity.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTAs - Better hierarchy */}
                  {selectedSuite.status !== 'sold' && (
                    <div className="space-y-3">
                      <button className="w-full py-4 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                        <Phone className="w-5 h-5" />
                        Schedule a Viewing
                      </button>
                      <div className="flex gap-3">
                        <button className="flex-1 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                          <Download className="w-4 h-4" />
                          Brochure
                        </button>
                        <button className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Similar Suites */}
                  {similarSuites.length > 0 && (
                    <div className="mt-6 pt-5 border-t border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Bed className="w-4 h-4 text-amber-500" />
                        Similar Suites
                      </h3>
                      <div className="space-y-2">
                        {similarSuites.slice(0, 3).map((suite) => (
                          <button
                            key={suite.id}
                            onClick={() => setSelectedSuite(suite)}
                            className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={getSuiteImage(suite.unit_number)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                                  Suite {suite.floor}-{suite.unit_number}
                                </div>
                                <div className="text-sm text-slate-500">{suite.size_sqm} m²</div>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom safe area for mobile */}
                <div className="h-6 flex-shrink-0" />
              </div>
            </div>
          </>
        )}

        {/* OPTION C: Large Modal Overlay - UX Optimized */}
        {viewMode === 'C' && selectedSuite && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleClosePanel}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden animate-modal-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full max-h-[90vh]">
                {/* Left: Image Gallery - Enhanced */}
                <div className="w-[55%] bg-slate-900 relative min-h-[500px]">
                  <img
                    src={activeImageTab === 'floorplan' ? getFloorPlanImage(selectedSuite.unit_number) : getSuiteImage(selectedSuite.unit_number)}
                    alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Image Tabs - 44px touch targets */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {['interior', 'views', 'floorplan'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveImageTab(tab as any)}
                        className={cn(
                          'px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all duration-200 capitalize',
                          activeImageTab === tab
                            ? 'bg-white text-slate-900 shadow-lg'
                            : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Image Navigation Arrows */}
                  {activeImageTab !== 'floorplan' && (
                    <>
                      <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95">
                        <ChevronLeft className="w-6 h-6 text-slate-700" />
                      </button>
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95">
                        <ChevronRight className="w-6 h-6 text-slate-700" />
                      </button>
                    </>
                  )}

                  {/* Suite Name Overlay - Better typography hierarchy */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-3',
                      selectedSuite.status === 'available' ? 'bg-green-500 text-white' :
                      selectedSuite.status === 'reserved' ? 'bg-amber-500 text-white' :
                      'bg-slate-500 text-white'
                    )}>
                      {(() => {
                        const StatusIcon = statusConfig[selectedSuite.status].icon
                        return <StatusIcon className="w-4 h-4" />
                      })()}
                      {statusConfig[selectedSuite.status].label}
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-bold text-white heading-display">
                      Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                    </h2>
                    <p className="text-amber-300 text-xl lg:text-2xl mt-2 font-medium">{getSuiteType(selectedSuite.size_sqm)}</p>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-full">
                    1 / 3
                  </div>
                </div>

                {/* Right: Details - Enhanced layout */}
                <div className="w-[45%] overflow-y-auto flex flex-col">
                  {/* Sticky Header */}
                  <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 text-sm font-medium">Starting from</div>
                      <div className="text-2xl lg:text-3xl font-bold text-slate-900 heading-display">Contact for Pricing</div>
                    </div>
                    <button
                      onClick={handleClosePanel}
                      className="p-3 min-w-[48px] min-h-[48px] bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
                      aria-label="Close modal"
                    >
                      <CloseIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="p-6 flex-1">
                    {/* Quick Stats - Enhanced cards */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200/50">
                        <Maximize2 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 heading-display">{selectedSuite.size_sqm}</div>
                        <div className="text-xs text-slate-500 font-medium">Square Meters</div>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200/50">
                        <Building2 className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 heading-display">{selectedSuite.floor}</div>
                        <div className="text-xs text-slate-500 font-medium">Floor Level</div>
                      </div>
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200/50">
                        <Mountain className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-slate-900 heading-display">Ocean</div>
                        <div className="text-xs text-slate-500 font-medium">View</div>
                      </div>
                    </div>

                    {/* Features & Amenities - Two columns with all items */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Suite Features
                        </h3>
                        <div className="space-y-2.5">
                          {SUITE_FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-slate-700">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{feature.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          Hotel Amenities
                        </h3>
                        <div className="space-y-2.5">
                          {HOTEL_AMENITIES.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-slate-700">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{amenity.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTAs - Enhanced with better hierarchy */}
                    {selectedSuite.status !== 'sold' && (
                      <div className="space-y-3 mb-6">
                        <button className="w-full py-4 min-h-[52px] bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-[0.98]">
                          <Phone className="w-5 h-5" />
                          Schedule a Viewing
                        </button>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3.5 min-h-[48px] bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                            <Download className="w-4 h-4" />
                            Brochure
                          </button>
                          <button className="flex-1 py-3.5 min-h-[48px] bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                        {/* View on Floor Plan - New UX feature */}
                        <button
                          onClick={handleClosePanel}
                          className="w-full py-3 min-h-[44px] bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          View on Floor Plan
                        </button>
                      </div>
                    )}

                    {/* Similar Suites - Enhanced cards */}
                    {similarSuites.length > 0 && (
                      <div className="pt-5 border-t border-slate-200">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Bed className="w-4 h-4 text-amber-500" />
                          Similar Suites
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {similarSuites.slice(0, 4).map((suite) => (
                            <button
                              key={suite.id}
                              onClick={() => setSelectedSuite(suite)}
                              className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all text-left group"
                            >
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">Suite {suite.floor}-{suite.unit_number}</div>
                                <div className="text-sm text-slate-500">{suite.size_sqm} m²</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-xs">© 2024 Pullman Hotel & Casino Panama</p>
          <p className="text-gold-500 text-xs mt-1">
            A/B Test Mode: {viewMode === 'A' ? 'Slide-in Panel' : viewMode === 'B' ? 'Full Page Navigation' : 'Large Modal'}
          </p>
        </div>
      </footer>
    </div>
  )
}
