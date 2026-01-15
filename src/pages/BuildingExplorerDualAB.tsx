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
type ViewMode = 'A' | 'C'

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

// Unified gallery data structure for modal
const getGalleryImages = (unitNumber: number): Record<string, string[]> => ({
  floorplan: [getFloorPlanImage(unitNumber)],
  interior: getSuiteImages(unitNumber),
  views: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  ]
})

const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-green-500', bg: 'bg-green-500', bgLight: 'bg-green-50' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-amber-500', bg: 'bg-amber-500', bgLight: 'bg-amber-50' },
  sold: { icon: Lock, label: 'Sold', color: 'text-red-500', bg: 'bg-red-500', bgLight: 'bg-red-50' },
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
  const [viewMode, setViewMode] = useState<ViewMode>('C')
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'views' | 'floorplan'>('interior')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [showFloorPlanFullscreen, setShowFloorPlanFullscreen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    setSelectedSuite(suite)
    setActiveImageTab('floorplan') // Show floor plan first
    setCurrentImageIndex(0) // Reset image index
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

  // Get similar suites - prioritize same floor, then similar size
  const similarSuites = apartments
    .filter(apt =>
      apt.id !== selectedSuite?.id &&
      apt.status === 'available' &&
      Math.abs(apt.size_sqm - (selectedSuite?.size_sqm || 0)) < 15
    )
    .sort((a, b) => {
      // Prioritize same floor
      const aOnSameFloor = a.floor === selectedSuite?.floor ? 0 : 1
      const bOnSameFloor = b.floor === selectedSuite?.floor ? 0 : 1
      if (aOnSameFloor !== bOnSameFloor) return aOnSameFloor - bOnSameFloor
      // Then sort by size similarity
      const aSizeDiff = Math.abs(a.size_sqm - (selectedSuite?.size_sqm || 0))
      const bSizeDiff = Math.abs(b.size_sqm - (selectedSuite?.size_sqm || 0))
      return aSizeDiff - bSizeDiff
    })
    .slice(0, 4)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 overflow-hidden">
      {/* Header - Enhanced with Breadcrumbs */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          {/* Top Row: Logo + A/B Toggle + Nav */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-8 lg:h-12 w-auto" />
              </Link>

              {/* Mobile Floor Selector - Only visible on mobile */}
              <div className="flex lg:hidden items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={handleFloorDown}
                  className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-white transition-colors flex items-center justify-center"
                  aria-label="Previous floor"
                >
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-center min-w-[50px] px-2">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">F{selectedFloor}</div>
                </div>
                <button
                  onClick={handleFloorUp}
                  className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-white transition-colors flex items-center justify-center"
                  aria-label="Next floor"
                >
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Breadcrumb Navigation - Desktop only */}
              <nav className="hidden lg:flex items-center gap-2 text-sm ml-4 pl-4 border-l border-slate-200">
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

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link to="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        {/* LEFT: Collapsible Tower Building Panel - HIDDEN on mobile */}
        <div
          className={cn(
            "hidden lg:flex flex-col border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 ease-out overflow-hidden",
            leftPanelCollapsed
              ? "lg:w-[80px] p-2"
              : "lg:w-[32%] p-4"
          )}
        >
          {/* Panel Header with Collapse Toggle */}
          <div className={cn(
            "mb-2 flex items-center justify-between flex-shrink-0",
            leftPanelCollapsed && "flex-col gap-2"
          )}>
            {!leftPanelCollapsed && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">Select Floor</h2>
                <p className="text-xs text-gold-600">Click building to choose floor</p>
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
            /* Expanded State: Full Building View - Responsive like main page */
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div className="relative h-[70%] w-auto" style={{ aspectRatio: '3/4' }}>
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

        {/* MIDDLE: Floor Plan - Full width on mobile, expands when left panel collapses on desktop */}
        <div className={cn(
          "flex-1 p-2 lg:p-4 flex flex-col bg-white transition-all duration-300 ease-out overflow-hidden",
          leftPanelCollapsed ? "lg:flex-1" : "lg:w-[65%]"
        )}>
          <div className="mb-2 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-slate-900">Floor {selectedFloor} Layout</h2>
              <p className="text-xs lg:text-sm text-slate-500 mt-0.5 lg:mt-1">
                Tap any suite to view details
              </p>
            </div>
            {/* Legend - Compact on mobile, expanded on desktop */}
            <div className="flex items-center gap-2 lg:gap-6 px-2 lg:px-5 py-1.5 lg:py-2.5 bg-white rounded-lg lg:rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-1 lg:gap-2">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-[3px] lg:rounded-[4px] bg-green-100 border-2 border-green-500" />
                <span className="hidden lg:inline text-[13px] text-slate-600 font-medium">Available</span>
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-[3px] lg:rounded-[4px] bg-amber-100 border-2 border-amber-500" />
                <span className="hidden lg:inline text-[13px] text-slate-600 font-medium">Reserved</span>
              </div>
              <div className="flex items-center gap-1 lg:gap-2">
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-[3px] lg:rounded-[4px] bg-red-100 border-2 border-red-500" />
                <span className="hidden lg:inline text-[13px] text-slate-600 font-medium">Sold</span>
              </div>
            </div>
          </div>

          {/* SVG Floor Plan */}
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-2 overflow-hidden">
            <FloorPlanSVG
              floor={selectedFloor}
              suites={floorApartments}
              onSuiteClick={handleSuiteClick}
              selectedSuiteId={selectedSuite?.id}
            />
          </div>

          {/* Floor Stats Bar - Compact on mobile */}
          <div className="mt-2 p-2 lg:p-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg shadow-lg flex-shrink-0">
            <div className="flex items-center justify-around text-center">
              <div>
                <div className="text-base lg:text-lg font-bold text-white">{floorApartments.length}</div>
                <div className="text-[9px] lg:text-[10px] text-slate-400">Total</div>
              </div>
              <div className="w-px h-6 lg:h-8 bg-slate-700" />
              <div>
                <div className="text-base lg:text-lg font-bold text-green-400">{getFloorStats(selectedFloor).available}</div>
                <div className="text-[9px] lg:text-[10px] text-slate-400">Available</div>
              </div>
              <div className="w-px h-6 lg:h-8 bg-slate-700" />
              <div>
                <div className="text-base lg:text-lg font-bold text-amber-400">{getFloorStats(selectedFloor).reserved}</div>
                <div className="text-[9px] lg:text-[10px] text-slate-400">Reserved</div>
              </div>
              <div className="w-px h-6 lg:h-8 bg-slate-700" />
              <div>
                <div className="text-base lg:text-lg font-bold text-red-400">{getFloorStats(selectedFloor).sold}</div>
                <div className="text-[9px] lg:text-[10px] text-slate-400">Sold</div>
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
                      className={cn(
                        "w-full h-full object-cover",
                        activeImageTab === 'floorplan' && "cursor-pointer hover:opacity-90 transition-opacity"
                      )}
                      onClick={() => {
                        if (activeImageTab === 'floorplan') {
                          setShowFloorPlanFullscreen(true)
                        }
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                      activeImageTab === 'floorplan' && "pointer-events-none"
                    )} />

                    {/* Click to enlarge hint for floor plan */}
                    {activeImageTab === 'floorplan' && (
                      <div className="absolute top-4 right-4 px-3 py-2 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-lg flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        Click to enlarge
                      </div>
                    )}

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
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                      </h2>
                      <p className="text-amber-200 text-base sm:text-lg mt-1 font-medium">
                        {getSuiteType(selectedSuite.size_sqm)}
                      </p>
                    </div>

                    {/* Image Counter */}
                    {activeImageTab !== 'floorplan' && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-full">
                        1 / 3
                      </div>
                    )}
                  </div>

                  {/* Image Tabs - Hide interior/views when floorplan is active */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {activeImageTab === 'floorplan' ? (
                      <button
                        onClick={() => setActiveImageTab('interior')}
                        className="px-4 py-2.5 min-h-[44px] rounded-full text-sm font-semibold transition-all bg-white text-slate-900 shadow-md"
                      >
                        ← Back to Gallery
                      </button>
                    ) : (
                      ['interior', 'views'].map((tab) => (
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
                      ))
                    )}
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
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.size_sqm}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">m²</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                      <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.floor}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">Floor</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                      <Mountain className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
                      <div className="text-xl font-bold text-slate-900">Ocean</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">View</div>
                    </div>
                  </div>

                  {/* Price Card - Cleaner */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 mb-5 shadow-lg">
                    <div className="text-slate-400 text-sm font-medium">Starting from</div>
                    <div className="text-2xl font-bold text-white mt-1">Contact for Pricing</div>
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
                        Contact Us
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

        {/* OPTION C: Large Modal Overlay - Mobile Optimized Bottom Sheet / Desktop Modal */}
        {viewMode === 'C' && selectedSuite && (
          <div
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={handleClosePanel}
          >
            <div
              className="bg-white w-full lg:rounded-2xl rounded-t-3xl shadow-2xl lg:max-w-6xl max-h-[95vh] lg:max-h-[80vh] overflow-hidden animate-slide-up lg:animate-modal-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile: Stacked layout | Desktop: Side-by-side */}
              <div className="flex flex-col lg:flex-row h-full max-h-[95vh] lg:max-h-[80vh]">
                {/* Image Gallery - Full width on mobile, 50% on desktop */}
                {(() => {
                  const galleryImages = getGalleryImages(selectedSuite.unit_number)
                  const currentImages = galleryImages[activeImageTab] || []
                  const currentImage = currentImages[currentImageIndex] || currentImages[0]
                  const hasMultipleImages = currentImages.length > 1

                  const nextImage = () => {
                    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
                  }
                  const prevImage = () => {
                    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
                  }

                  return (
                    <div className="w-full lg:w-[50%] bg-slate-900 flex flex-col flex-shrink-0">
                      {/* Main Image */}
                      <div className="relative h-[200px] sm:h-[250px] lg:flex-1 lg:min-h-[300px]">
                        <img
                          src={currentImage}
                          alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                          className={cn(
                            "w-full h-full object-cover",
                            activeImageTab === 'floorplan' && "cursor-pointer hover:opacity-90 transition-opacity object-contain bg-white"
                          )}
                          onClick={() => {
                            if (activeImageTab === 'floorplan') {
                              setShowFloorPlanFullscreen(true)
                            }
                          }}
                        />
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                          activeImageTab === 'floorplan' && "hidden"
                        )} />

                        {/* Navigation Arrows - Show when multiple images */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 lg:left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
                            >
                              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 lg:right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all active:scale-95"
                            >
                              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-slate-700" />
                            </button>
                          </>
                        )}

                        {/* Image Counter - Show when multiple images */}
                        {hasMultipleImages && (
                          <div className="absolute top-3 right-3 lg:top-4 lg:right-4 px-2.5 py-1 lg:px-3 lg:py-1.5 bg-black/60 backdrop-blur text-white text-xs lg:text-sm font-medium rounded-full">
                            {currentImageIndex + 1} / {currentImages.length}
                          </div>
                        )}

                        {/* Click to enlarge hint for floor plan */}
                        {activeImageTab === 'floorplan' && (
                          <div className="absolute top-3 left-3 lg:top-4 lg:left-4 px-2.5 py-1.5 lg:px-3 lg:py-2 bg-black/60 backdrop-blur text-white text-xs lg:text-sm font-medium rounded-lg flex items-center gap-1.5 lg:gap-2">
                            <Maximize2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                            <span className="hidden sm:inline">Click to enlarge</span>
                            <span className="sm:hidden">Tap</span>
                          </div>
                        )}

                        {/* Suite Name Overlay - Only show on interior/views */}
                        {activeImageTab !== 'floorplan' && (
                          <div className="absolute bottom-3 lg:bottom-4 left-3 lg:left-4 right-3 lg:right-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold mb-1.5 lg:mb-2',
                              selectedSuite.status === 'available' ? 'bg-green-500 text-white' :
                              selectedSuite.status === 'reserved' ? 'bg-amber-500 text-white' :
                              'bg-slate-500 text-white'
                            )}>
                              {(() => {
                                const StatusIcon = statusConfig[selectedSuite.status].icon
                                return <StatusIcon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                              })()}
                              {statusConfig[selectedSuite.status].label}
                            </span>
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                              Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                            </h2>
                            <p className="text-amber-300 text-sm lg:text-base mt-0.5 font-medium">{getSuiteType(selectedSuite.size_sqm)}</p>
                          </div>
                        )}

                        {/* Mobile drag handle indicator */}
                        <div className="lg:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/50 rounded-full" />
                      </div>

                      {/* Thumbnail Gallery Strip */}
                      <div className="bg-slate-800 p-2 lg:p-3">
                        <div className="flex gap-1.5 lg:gap-2 overflow-x-auto pb-1">
                          {/* Floor Plan Thumbnail */}
                          <button
                            onClick={() => {
                              setActiveImageTab('floorplan')
                              setCurrentImageIndex(0)
                            }}
                            className={cn(
                              "flex-shrink-0 w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden border-2 transition-all relative group",
                              activeImageTab === 'floorplan'
                                ? "border-amber-500 shadow-lg shadow-amber-500/30"
                                : "border-transparent opacity-70 hover:opacity-100 hover:border-white/50"
                            )}
                          >
                            <img
                              src={galleryImages.floorplan[0]}
                              alt="Floor Plan"
                              className="w-full h-full object-contain bg-white"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[9px] lg:text-[10px] font-semibold text-white uppercase tracking-wide">Plan</span>
                            </div>
                          </button>

                          {/* Interior Images Thumbnails */}
                          {galleryImages.interior.map((img, idx) => (
                            <button
                              key={`interior-${idx}`}
                              onClick={() => {
                                setActiveImageTab('interior')
                                setCurrentImageIndex(idx)
                              }}
                              className={cn(
                                "flex-shrink-0 w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden border-2 transition-all relative group",
                                activeImageTab === 'interior' && currentImageIndex === idx
                                  ? "border-amber-500 shadow-lg shadow-amber-500/30"
                                  : "border-transparent opacity-70 hover:opacity-100 hover:border-white/50"
                              )}
                            >
                              <img
                                src={img}
                                alt={`Interior ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}

                          {/* Views Thumbnails */}
                          {galleryImages.views.map((img, idx) => (
                            <button
                              key={`views-${idx}`}
                              onClick={() => {
                                setActiveImageTab('views')
                                setCurrentImageIndex(idx)
                              }}
                              className={cn(
                                "flex-shrink-0 w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden border-2 transition-all relative group",
                                activeImageTab === 'views' && currentImageIndex === idx
                                  ? "border-amber-500 shadow-lg shadow-amber-500/30"
                                  : "border-transparent opacity-70 hover:opacity-100 hover:border-white/50"
                              )}
                            >
                              <img
                                src={img}
                                alt={`View ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Details Panel - Full width on mobile, 50% on desktop */}
                <div className="w-full lg:w-[50%] overflow-y-auto flex flex-col flex-1">
                  {/* Sticky Header - Mobile optimized */}
                  <div className="sticky top-0 bg-white z-10 px-4 lg:px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-500 text-xs lg:text-sm font-medium">Starting from</div>
                      <div className="text-xl lg:text-3xl font-bold text-slate-900">Contact for Pricing</div>
                    </div>
                    <button
                      onClick={handleClosePanel}
                      className="p-2.5 lg:p-3 min-w-[44px] min-h-[44px] lg:min-w-[48px] lg:min-h-[48px] bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
                      aria-label="Close modal"
                    >
                      <CloseIcon className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>

                  <div className="p-3 lg:p-4 flex-1">
                    {/* Quick Stats - Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex lg:grid lg:grid-cols-3 gap-2 mb-4 overflow-x-auto pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0">
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200/50 min-w-[100px] lg:min-w-0 flex-shrink-0">
                        <Maximize2 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-900">{selectedSuite.size_sqm}</div>
                        <div className="text-[10px] text-slate-500 font-medium">m²</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200/50 min-w-[100px] lg:min-w-0 flex-shrink-0">
                        <Building2 className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-900">{selectedSuite.floor}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Floor</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 text-center border border-slate-200/50 min-w-[100px] lg:min-w-0 flex-shrink-0">
                        <Mountain className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-slate-900">Ocean</div>
                        <div className="text-[10px] text-slate-500 font-medium">View</div>
                      </div>
                    </div>

                    {/* Features & Amenities - Collapsible on mobile for space */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 mb-4">
                      <div className="bg-slate-50 rounded-lg p-2.5 lg:p-3 border border-slate-100">
                        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 lg:mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Suite Features
                        </h3>
                        <div className="flex flex-wrap lg:flex-col gap-x-4 gap-y-1 lg:space-y-1.5">
                          {SUITE_FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-center gap-1.5 lg:gap-2 text-slate-700">
                              <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-[11px] lg:text-xs">{feature.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2.5 lg:p-3 border border-slate-100">
                        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 lg:mb-2 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          Hotel Amenities
                        </h3>
                        <div className="flex flex-wrap lg:flex-col gap-x-4 gap-y-1 lg:space-y-1.5">
                          {HOTEL_AMENITIES.slice(0, 4).map((amenity, i) => (
                            <div key={i} className="flex items-center gap-1.5 lg:gap-2 text-slate-700">
                              <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-[11px] lg:text-xs">{amenity.label}</span>
                            </div>
                          ))}
                          <span className="text-[11px] lg:hidden text-amber-600 font-medium">+2 more</span>
                          {HOTEL_AMENITIES.slice(4).map((amenity, i) => (
                            <div key={i} className="hidden lg:flex items-center gap-2 text-slate-700">
                              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-xs">{amenity.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTAs - Sticky on mobile */}
                    {selectedSuite.status !== 'sold' && (
                      <div className="space-y-2 mb-4">
                        <button className="w-full py-3 min-h-[48px] bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]">
                          <Phone className="w-4 h-4" />
                          Contact Us
                        </button>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2.5 min-h-[44px] bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            <Download className="w-3.5 h-3.5" />
                            Brochure
                          </button>
                          <button className="flex-1 py-2.5 min-h-[44px] bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]">
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Similar Suites - Horizontal scroll on mobile */}
                    {similarSuites.length > 0 && (
                      <div className="pt-3 border-t border-slate-200">
                        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-amber-500" />
                          Similar Suites
                        </h3>
                        <div className="flex lg:grid lg:grid-cols-4 gap-1.5 overflow-x-auto pb-2 lg:pb-0 -mx-3 px-3 lg:mx-0 lg:px-0">
                          {similarSuites.slice(0, 4).map((suite) => (
                            <button
                              key={suite.id}
                              onClick={() => setSelectedSuite(suite)}
                              className="p-2.5 lg:p-2 min-w-[80px] lg:min-w-0 flex-shrink-0 bg-white rounded-lg border border-slate-200 hover:border-amber-300 hover:shadow-sm transition-all text-left group"
                            >
                              <div className="text-xs font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">{suite.floor}-{suite.unit_number}</div>
                              <div className="text-[10px] text-slate-500">{suite.size_sqm}m²</div>
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

        {/* Fullscreen Floor Plan Modal */}
        {showFloorPlanFullscreen && selectedSuite && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
            onClick={() => setShowFloorPlanFullscreen(false)}
          >
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center">
              <img
                src={getFloorPlanImage(selectedSuite.unit_number)}
                alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number} Floor Plan`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Close button */}
              <button
                onClick={() => setShowFloorPlanFullscreen(false)}
                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all"
                aria-label="Close fullscreen"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>

              {/* Suite info overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur rounded-xl px-6 py-3 shadow-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">
                    Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                  </div>
                  <div className="text-sm text-slate-500">
                    {getSuiteType(selectedSuite.size_sqm)} • {selectedSuite.size_sqm} m²
                  </div>
                </div>
              </div>

              {/* Click anywhere hint */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-lg">
                Click anywhere to close
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
