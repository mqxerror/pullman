import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import {
  X, Maximize2, Building2, Check, Clock, Lock, ChevronUp, ChevronDown,
  ArrowLeft, Bed, ChevronRight, Sparkles, Star, Wifi, Car, Dumbbell, Coffee, Shield, Waves,
  Home, Scale, Plus, Sun, Users
} from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR, TOTAL_FLOORS, isAmenityFloor, AMENITY_FLOOR_LABELS } from '@/config/building'
import { getSuiteType, getSuiteImage, getSuiteInfo, SUITE_PRICES, formatPriceUSD, formatPriceShort, PRICE_PER_SQM } from '@/config/suiteData'
import { cn } from '@/lib/utils'
import FloorPlanSVG from '@/components/FloorPlanSVG'
import BuildingFacadeSVG from '@/components/BuildingFacadeSVG'
import TourGuide from '@/components/TourGuide'

// A/B Test Variants
// Helper to get floor plan for specific unit
const getFloorPlanImage = (unitNumber: number): string => {
  const suiteInfo = getSuiteInfo(unitNumber)
  return suiteInfo?.floorPlanFile || '/assets/floorplans/floor-overview.png'
}

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
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'floorplan'>('floorplan')
  const [showFloorPlanFullscreen, setShowFloorPlanFullscreen] = useState(false)

  // Compare mode state (max 3 suites)
  const [compareSuites, setCompareSuites] = useState<ExecutiveSuite[]>([])
  const [showCompareView, setShowCompareView] = useState(false)
  const [showCompareHint, setShowCompareHint] = useState(true)

  // Dismiss compare hint after first compare or after timeout
  useEffect(() => {
    if (compareSuites.length > 0) {
      setShowCompareHint(false)
    }
  }, [compareSuites.length])

  // Auto-dismiss hint after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowCompareHint(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  // Add/remove suite from comparison
  const toggleCompare = useCallback((suite: ExecutiveSuite) => {
    setCompareSuites(prev => {
      const isAlreadyComparing = prev.some(s => s.id === suite.id)
      if (isAlreadyComparing) {
        return prev.filter(s => s.id !== suite.id)
      }
      if (prev.length >= 3) {
        // Replace oldest with new
        return [...prev.slice(1), suite]
      }
      return [...prev, suite]
    })
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10])
    }
  }, [])

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

  const floors = Array.from({ length: TOTAL_FLOORS }, (_, i) => MAX_FLOOR - i)

  const handleFloorUp = () => {
    if (selectedFloor < MAX_FLOOR) setSelectedFloor(selectedFloor + 1)
  }

  const handleFloorDown = () => {
    if (selectedFloor > MIN_FLOOR) setSelectedFloor(selectedFloor - 1)
  }

  const activeFloor = selectedFloor

  const handleClosePanel = useCallback(() => {
    setSelectedSuite(null)
  }, [])

  const handleSuiteClick = (suite: ExecutiveSuite) => {
    setSelectedSuite(suite)
    setActiveImageTab('floorplan') // Show floor plan first
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

  // Lock body scroll when modal is open to prevent scrollbar flicker
  useEffect(() => {
    if (selectedSuite) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [selectedSuite])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 overflow-hidden">
      {/* Header - Enhanced with Breadcrumbs */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6">
          {/* Top Row: Logo + A/B Toggle + Nav */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-10 lg:h-14 w-auto" />
              </Link>

              {/* Mobile Floor Selector removed - using bottom floating badge instead */}

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

            {/* Navigation Links + Tour */}
            <div className="hidden lg:flex items-center gap-4">
              <nav className="flex items-center gap-6">
                <Link to="/apartments" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Apartments</Link>
                <Link to="/location" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Location</Link>
                <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              </nav>
              <TourGuide tourId="buildingWizard" variant="icon" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden min-h-0">
        {/* LEFT: Floor Navigator + Building Image - Santa Maria Style - HIDDEN on mobile */}
        <div className="hidden lg:flex flex-row border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 lg:w-[38%] xl:w-[36%] 2xl:w-[34%] overflow-hidden">
          {/* Left: Compact Floor Navigator */}
          <div data-tour="floor-navigator" className="w-[100px] flex flex-col bg-slate-50 border-r border-slate-200 p-2">
            {/* Header */}
            <div className="text-center py-2 border-b border-slate-200 mb-2">
              <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Floors</span>
            </div>

            {/* Floor List - Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1">
              <div className="flex flex-col gap-1">
                {floors.map((floor) => {
                  const stats = getFloorStats(floor)
                  const isSelected = selectedFloor === floor
                  const isAmenity = isAmenityFloor(floor)

                  return (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={cn(
                        "relative px-2 py-2 rounded-lg text-center transition-all",
                        isSelected
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30"
                          : "bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 hover:border-amber-300"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-bold tabular-nums",
                        isSelected ? "text-white" : "text-slate-900"
                      )}>
                        {floor}
                      </div>
                      {!isAmenity && (
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            stats.available > 0 ? "bg-green-500" : "bg-slate-300"
                          )} />
                          <span className={cn(
                            "text-[9px] font-medium",
                            isSelected ? "text-white/90" : "text-slate-500"
                          )}>
                            {stats.available}/{stats.total}
                          </span>
                        </div>
                      )}
                      {isAmenity && (
                        <div className={cn(
                          "text-[8px] font-medium mt-0.5",
                          isSelected ? "text-white/80" : "text-amber-600"
                        )}>
                          {floor === 27 ? 'Sky Bar' : 'Pool'}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Floor Stats Summary */}
            <div data-tour="floor-stats" className="pt-2 mt-2 border-t border-slate-200">
              <div className="bg-white rounded-lg p-2 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[9px] text-slate-500">Avail</span>
                  </div>
                  <span className="text-xs font-bold text-green-600">{getFloorStats(activeFloor).available}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[9px] text-slate-500">Rsrvd</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600">{getFloorStats(activeFloor).reserved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] text-slate-500">Sold</span>
                  </div>
                  <span className="text-xs font-bold text-red-600">{getFloorStats(activeFloor).sold}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Building Image with SVG Overlay */}
          <div data-tour="building-image" className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <BuildingFacadeSVG
              selectedFloor={selectedFloor}
              hoveredFloor={hoveredFloor}
              onFloorSelect={setSelectedFloor}
              onFloorHover={setHoveredFloor}
            />
          </div>
        </div>

        {/* MIDDLE: Floor Plan - Full width on mobile */}
        <div className="flex-1 p-2 lg:p-4 flex flex-col bg-white transition-all duration-300 ease-out overflow-hidden lg:w-[62%] xl:w-[64%] 2xl:w-[66%]">
          <div className="mb-2 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg lg:text-2xl font-bold text-slate-900">
                {isAmenityFloor(selectedFloor)
                  ? AMENITY_FLOOR_LABELS[selectedFloor] || `Floor ${selectedFloor}`
                  : `Floor ${selectedFloor} Layout`}
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 mt-0.5 lg:mt-1">
                {isAmenityFloor(selectedFloor)
                  ? 'Exclusive amenity floor for residents'
                  : 'Tap any suite to view details'}
              </p>
            </div>
            {/* Legend - Only show for residential floors */}
            {!isAmenityFloor(selectedFloor) && (
              <div className="flex items-center gap-3 lg:gap-5 px-3 lg:px-5 py-2 lg:py-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500" />
                  <span className="text-[11px] lg:text-[13px] text-slate-600 font-medium">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 border-2 border-amber-500" />
                  <span className="text-[11px] lg:text-[13px] text-slate-600 font-medium">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-500" />
                  <span className="text-[11px] lg:text-[13px] text-slate-600 font-medium">Sold</span>
                </div>
              </div>
            )}
          </div>

          {/* Amenity Floor Display or SVG Floor Plan */}
          <div data-tour="floor-plan" className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-2 overflow-hidden relative">
            {isAmenityFloor(selectedFloor) ? (
              /* Amenity Floor Content with Hero Image */
              <div className="w-full h-full relative rounded-lg overflow-hidden">
                {/* Background Image */}
                <img
                  src={selectedFloor === 26
                    ? "/assets/gallery/rooftop-pool.jpg"
                    : "/assets/gallery/lobby.jpg"}
                  alt={AMENITY_FLOOR_LABELS[selectedFloor]}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className={cn(
                  "absolute inset-0",
                  selectedFloor === 27
                    ? "bg-gradient-to-t from-amber-900/90 via-amber-900/50 to-amber-900/30"
                    : "bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-blue-900/30"
                )} />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-6 lg:p-8">
                  {/* Icon Badge */}
                  <div className={cn(
                    "w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mb-4 lg:mb-6 backdrop-blur-sm",
                    selectedFloor === 27 ? "bg-amber-500/30 ring-2 ring-amber-400/50" : "bg-blue-500/30 ring-2 ring-blue-400/50"
                  )}>
                    {selectedFloor === 27 ? (
                      <Coffee className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    ) : (
                      <Waves className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-2 lg:mb-3 drop-shadow-lg">
                    {AMENITY_FLOOR_LABELS[selectedFloor]}
                  </h3>

                  {/* Floor Badge */}
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs lg:text-sm font-medium mb-4 lg:mb-6",
                    selectedFloor === 27 ? "bg-amber-500/40 text-amber-100" : "bg-blue-500/40 text-blue-100"
                  )}>
                    Floor {selectedFloor}
                  </div>

                  {/* Description */}
                  <p className="text-white/90 max-w-md mb-6 lg:mb-8 text-sm lg:text-base leading-relaxed drop-shadow">
                    {selectedFloor === 27
                      ? 'Experience panoramic views of Panama City while enjoying premium cocktails and gourmet dining at our exclusive Sky Bar & Lounge.'
                      : 'Unwind at our stunning rooftop infinity pool with breathtaking views of the Panama City skyline. Open daily for all residents.'}
                  </p>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-lg lg:max-w-2xl">
                    {selectedFloor === 27 ? (
                      <>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Star className="w-5 h-5 lg:w-6 lg:h-6 text-amber-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Premium Bar</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Coffee className="w-5 h-5 lg:w-6 lg:h-6 text-amber-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Fine Dining</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-amber-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">City Views</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Users className="w-5 h-5 lg:w-6 lg:h-6 text-amber-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">VIP Lounge</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Waves className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Infinity Pool</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Sun Deck</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Dumbbell className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Pool Cabanas</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-white/20">
                          <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-blue-300 mx-auto mb-1.5 lg:mb-2" />
                          <div className="text-xs lg:text-sm font-medium text-white">Skyline Views</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Regular Floor Plan */
              <>
                <FloorPlanSVG
                  floor={selectedFloor}
                  suites={floorApartments}
                  onSuiteClick={handleSuiteClick}
                  onSuiteLongPress={toggleCompare}
                  selectedSuiteId={selectedSuite?.id}
                  compareSuiteIds={compareSuites.map(s => s.id)}
                />
                {/* Compare feature onboarding - prominent tooltip */}
                {showCompareHint && compareSuites.length === 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <div
                      className="relative px-4 py-2.5 bg-violet-600 text-white text-sm rounded-xl shadow-lg shadow-violet-500/30 flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowCompareHint(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold">Compare Suites</div>
                        <div className="text-violet-200 text-xs hidden lg:block">Shift+click any suite to add</div>
                        <div className="text-violet-200 text-xs lg:hidden">Long-press any suite to add</div>
                      </div>
                      <button
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowCompareHint(false)
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {/* Arrow pointing down */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-violet-600 rotate-45" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        {/* Suite Detail Sidebar - Wizard Style */}
        {selectedSuite && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={handleClosePanel}
            />

            {/* Sidebar Drawer */}
            <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] lg:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
              {/* Header */}
              <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
                <button
                  onClick={handleClosePanel}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Back</span>
                </button>

                <span className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold',
                  selectedSuite.status === 'available' && 'bg-green-50 text-green-700 border border-green-200',
                  selectedSuite.status === 'reserved' && 'bg-amber-50 text-amber-700 border border-amber-200',
                  selectedSuite.status === 'sold' && 'bg-slate-100 text-slate-600 border border-slate-200'
                )}>
                  {(() => {
                    const StatusIcon = statusConfig[selectedSuite.status].icon
                    return <StatusIcon className="w-4 h-4" />
                  })()}
                  {statusConfig[selectedSuite.status].label}
                </span>

                <button
                  onClick={handleClosePanel}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Image Section */}
                <div className="relative aspect-[16/10] bg-slate-100">
                  <img
                    src={activeImageTab === 'floorplan'
                      ? getFloorPlanImage(selectedSuite.unit_number)
                      : getSuiteImage(selectedSuite.unit_number)}
                    alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                    className={cn(
                      "w-full h-full object-cover",
                      activeImageTab === 'floorplan' && "cursor-pointer"
                    )}
                    onClick={() => activeImageTab === 'floorplan' && setShowFloorPlanFullscreen(true)}
                  />

                  {activeImageTab === 'floorplan' && (
                    <div className="absolute top-3 right-3 px-3 py-2 bg-black/60 text-white text-sm rounded-lg flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      Tap to zoom
                    </div>
                  )}

                  {/* Image Tabs */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 bg-black/50 backdrop-blur-sm rounded-full p-1">
                    <button
                      onClick={() => setActiveImageTab('floorplan')}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                        activeImageTab === 'floorplan' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/20'
                      )}
                    >
                      Floor Plan
                    </button>
                    <button
                      onClick={() => setActiveImageTab('interior')}
                      className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                        activeImageTab === 'interior' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/20'
                      )}
                    >
                      Interior
                    </button>
                  </div>
                </div>

                {/* Suite Info */}
                <div className="p-5">
                  {/* Title */}
                  <div className="mb-5">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">
                      Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                    </h3>
                    <p className="text-slate-500">
                      {getSuiteInfo(selectedSuite.unit_number)?.type || getSuiteType(selectedSuite.size_sqm)}
                    </p>
                  </div>

                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.size_sqm}</div>
                      <div className="text-xs text-slate-500">m² Size</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="text-xl font-bold text-slate-900">{selectedSuite.floor}</div>
                      <div className="text-xs text-slate-500">Floor</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-center gap-1">
                        <Bed className="w-5 h-5 text-slate-600" />
                        <span className="text-xl font-bold text-slate-900">1</span>
                      </div>
                      <div className="text-xs text-slate-500">Bedroom</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-amber-50 rounded-xl p-4 mb-6">
                    <div className="text-sm text-amber-700 font-medium mb-1">Investment Price</div>
                    <div className="text-2xl font-bold text-amber-900">
                      {formatPriceUSD(SUITE_PRICES[selectedSuite.unit_number] || selectedSuite.size_sqm * PRICE_PER_SQM)}
                    </div>
                    <div className="text-sm text-amber-700">
                      ${PRICE_PER_SQM.toLocaleString()} per m²
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Suite Features</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {SUITE_FEATURES.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                          <feature.icon className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-slate-700">{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hotel Amenities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Hotel Amenities Included</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {HOTEL_AMENITIES.map((amenity, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <amenity.icon className="w-4 h-4 text-slate-500" />
                          <span className="text-xs text-slate-600">{amenity.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom CTA */}
              {selectedSuite.status === 'available' && (
                <div className="flex-shrink-0 bg-white border-t border-slate-200 p-4">
                  <Link
                    to={`/suite/${selectedSuite.floor}/${selectedSuite.unit_number}`}
                    className="block w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-center transition-colors"
                  >
                    View Full Details
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* Fullscreen Floor Plan Modal — pinch-to-zoom enabled */}
        {showFloorPlanFullscreen && selectedSuite && (
          <div
            className="fixed inset-0 z-[60] flex flex-col bg-white animate-fade-in"
            onClick={() => setShowFloorPlanFullscreen(false)}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between p-3 border-b border-slate-200 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <div>
                <div className="text-base font-bold text-slate-900">
                  Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                </div>
                <div className="text-sm text-slate-500">
                  {getSuiteType(selectedSuite.size_sqm)} &bull; {selectedSuite.size_sqm} m² &bull; Pinch or scroll to zoom
                </div>
              </div>
              <button
                onClick={() => setShowFloorPlanFullscreen(false)}
                className="p-2.5 min-w-[44px] min-h-[44px] bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center"
                aria-label="Close fullscreen"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Scrollable + zoomable floor plan */}
            <div
              className="flex-1 overflow-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
            >
              <img
                src={getFloorPlanImage(selectedSuite.unit_number)}
                alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number} Floor Plan`}
                className="w-[200vw] md:w-[150vw] max-w-none h-auto mx-auto"
                draggable={false}
              />
            </div>
          </div>
        )}
      </main>

      {/* Persistent Floor Badge - Mobile only, stays visible even with modal */}
      <div className={cn(
        "lg:hidden fixed bottom-4 left-4 z-[45] animate-fade-in transition-all",
        compareSuites.length > 0 && "bottom-20" // Move up when compare bar is visible
      )}>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-white/10">
          <Building2 className="w-4 h-4 text-amber-400" />
          <span className="text-white font-bold text-sm tabular-nums">Floor {selectedFloor}</span>
          <div className="flex items-center gap-0.5 ml-1 border-l border-white/20 pl-2">
            <button
              onClick={handleFloorDown}
              disabled={selectedFloor <= MIN_FLOOR}
              className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
              aria-label="Previous floor"
            >
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleFloorUp}
              disabled={selectedFloor >= MAX_FLOOR}
              className="p-1 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors"
              aria-label="Next floor"
            >
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Compare Bar - Shows when suites are selected for comparison */}
      {compareSuites.length > 0 && !selectedSuite && (
        <div className="fixed bottom-0 left-0 right-0 z-[55] animate-slide-up">
          <div className="bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-4 py-3 safe-area-bottom">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
              {/* Selected Suites */}
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                <Scale className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-white/70 text-xs font-medium flex-shrink-0">Compare:</span>
                <div className="flex gap-2">
                  {compareSuites.map((suite) => (
                    <div
                      key={suite.id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/20"
                    >
                      <span className="text-white text-xs font-semibold">{suite.floor}-{suite.unit_number}</span>
                      <button
                        onClick={() => toggleCompare(suite)}
                        className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                        aria-label={`Remove Suite ${suite.floor}-${suite.unit_number} from comparison`}
                      >
                        <X className="w-3 h-3 text-white/70" />
                      </button>
                    </div>
                  ))}
                  {compareSuites.length < 3 && (
                    <div className="flex items-center gap-1 px-2 py-1.5 border border-dashed border-white/30 rounded-lg text-white/50 text-xs">
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">Add suite</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setCompareSuites([])}
                  className="px-3 py-2 text-white/70 text-xs font-medium hover:text-white transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCompareView(true)}
                  disabled={compareSuites.length < 2}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-white/20 disabled:text-white/50 text-slate-900 text-xs font-semibold rounded-lg transition-colors"
                >
                  Compare ({compareSuites.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare View Modal */}
      {showCompareView && compareSuites.length >= 2 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 lg:backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCompareView(false)}
        >
          <div
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Compare Suites</h2>
              </div>
              <button
                onClick={() => setShowCompareView(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Comparison Grid */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className={cn(
                "grid gap-4",
                compareSuites.length === 2 ? "grid-cols-2" : "grid-cols-3"
              )}>
                {compareSuites.map((suite) => {
                  const suiteInfo = getSuiteInfo(suite.unit_number)
                  return (
                    <div key={suite.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      {/* Suite Image */}
                      <div className="relative h-32 bg-slate-100">
                        <img
                          src={getSuiteImage(suite.unit_number)}
                          alt={`Suite ${suite.floor}-${suite.unit_number}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-semibold',
                            suite.status === 'available' ? 'bg-green-500 text-white' :
                            suite.status === 'reserved' ? 'bg-amber-500 text-white' :
                            'bg-slate-500 text-white'
                          )}>
                            {suite.status}
                          </span>
                        </div>
                      </div>

                      {/* Suite Details */}
                      <div className="p-3">
                        <h3 className="font-bold text-slate-900">Suite {suite.floor}-{suite.unit_number}</h3>
                        <p className="text-xs text-amber-600 font-medium mb-3">{suiteInfo?.type || 'Executive Suite'}</p>

                        {/* Stats */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Price</span>
                            <span className="font-semibold text-amber-600">{formatPriceShort(SUITE_PRICES[suite.unit_number])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Size</span>
                            <span className="font-semibold text-slate-900">{suite.size_sqm} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Floor</span>
                            <span className="font-semibold text-slate-900">{suite.floor}</span>
                          </div>
                        </div>

                        {/* Action */}
                        <button
                          onClick={() => {
                            setShowCompareView(false)
                            setSelectedSuite(suite)
                          }}
                          className="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
