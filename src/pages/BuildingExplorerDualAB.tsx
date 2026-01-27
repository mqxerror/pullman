import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import {
  X, Maximize2, Building2, Check, Clock, Lock, ChevronUp, ChevronDown,
  X as CloseIcon, ArrowRight, Bed, Mountain, Download, Share2,
  ChevronLeft, ChevronRight, Sparkles, Star, Wifi, Car, Dumbbell, Coffee, Shield, Waves,
  PanelLeftClose, PanelLeftOpen, Home, Scale, Plus, Sun, Users
} from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR, TOTAL_FLOORS, BUILDING_CONFIG, isAmenityFloor, AMENITY_FLOOR_LABELS } from '@/config/building'
import { getSuiteType, getSuiteImage, getSuiteInfo, SUITE_PRICES, formatPriceUSD, formatPriceShort, PRICE_PER_SQM } from '@/config/suiteData'
import { PriceTierBar } from '@/components/pricing/PriceTierBar'
import { cn } from '@/lib/utils'
import FloorPlanSVG from '@/components/FloorPlanSVG'

// A/B Test Variants
type ViewMode = 'A' | 'C'

// Helper to get floor plan for specific unit
const getFloorPlanImage = (unitNumber: number): string => {
  const suiteInfo = getSuiteInfo(unitNumber)
  return suiteInfo?.floorPlanFile || '/assets/floorplans/floor-overview.png'
}

// Unified gallery data structure for modal
// Only floor plan and one interior image - no duplicates, no placeholder views
const getGalleryImages = (unitNumber: number): Record<string, string[]> => ({
  floorplan: [getFloorPlanImage(unitNumber)],
  interior: [getSuiteImage(unitNumber)],
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
  const [viewMode, setViewMode] = useState<ViewMode>('C')
  void setViewMode // Prevent unused warning
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'floorplan'>('floorplan')
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [showFloorPlanFullscreen, setShowFloorPlanFullscreen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [shareMessage, setShareMessage] = useState<string | null>(null)

  // Swipe navigation state
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50

  // Image loading state for blur-up effect
  const [imageLoaded, setImageLoaded] = useState(false)

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

  // Reset image loaded state when suite changes
  useEffect(() => {
    setImageLoaded(false)
  }, [selectedSuite?.id, activeImageTab])

  // Share handler - uses Web Share API or falls back to clipboard
  const handleShare = async () => {
    if (!selectedSuite) return

    const suiteInfo = getSuiteInfo(selectedSuite.unit_number)
    const shareData = {
      title: `Suite ${selectedSuite.floor}-${selectedSuite.unit_number} | Pullman Hotel Panama`,
      text: `Check out this ${suiteInfo?.type || 'Executive Suite'} (${selectedSuite.size_sqm}m²) at Pullman Hotel & Casino Panama - Floor ${selectedSuite.floor}`,
      url: `${window.location.origin}/building?floor=${selectedSuite.floor}&unit=${selectedSuite.unit_number}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareData.url)
        setShareMessage('Link copied!')
        setTimeout(() => setShareMessage(null), 2000)
      }
    } catch (err) {
      // User cancelled or error - try clipboard fallback
      try {
        await navigator.clipboard.writeText(shareData.url)
        setShareMessage('Link copied!')
        setTimeout(() => setShareMessage(null), 2000)
      } catch {
        setShareMessage('Could not share')
        setTimeout(() => setShareMessage(null), 2000)
      }
    }
  }

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

  // Get adjacent suites for swipe navigation
  const getAdjacentSuites = useCallback(() => {
    if (!selectedSuite) return { prev: null, next: null }
    const currentIndex = floorApartments.findIndex(apt => apt.id === selectedSuite.id)
    return {
      prev: currentIndex > 0 ? floorApartments[currentIndex - 1] : null,
      next: currentIndex < floorApartments.length - 1 ? floorApartments[currentIndex + 1] : null,
    }
  }, [selectedSuite, floorApartments])

  // Navigate to adjacent suite
  const navigateToSuite = useCallback((direction: 'prev' | 'next') => {
    const { prev, next } = getAdjacentSuites()
    const targetSuite = direction === 'prev' ? prev : next
    if (targetSuite) {
      // Trigger haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
      setSelectedSuite(targetSuite)
      setActiveImageTab('floorplan')
      setCurrentImageIndex(0)
    }
  }, [getAdjacentSuites])

  // Touch handlers for swipe navigation
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    // Show swipe direction indicator
    if (touchStart && e.targetTouches[0].clientX) {
      const diff = touchStart - e.targetTouches[0].clientX
      if (Math.abs(diff) > 20) {
        setSwipeDirection(diff > 0 ? 'left' : 'right')
      }
    }
  }

  const onTouchEnd = () => {
    setSwipeDirection(null)
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      navigateToSuite('next')
    } else if (isRightSwipe) {
      navigateToSuite('prev')
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

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/apartments" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Apartments</Link>
              <Link to="/location" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Location</Link>
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">About</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden min-h-0">
        {/* LEFT: Collapsible Tower Building Panel - HIDDEN on mobile */}
        <div
          className={cn(
            "hidden lg:flex flex-col border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 transition-all duration-300 ease-out overflow-y-auto min-h-0",
            leftPanelCollapsed
              ? "lg:w-[80px] p-2"
              : "lg:w-[28%] xl:w-[30%] 2xl:w-[32%] p-3 xl:p-4"
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
            <>
            <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 p-2">
              <div className="relative h-full max-h-[90%] w-auto" style={{ aspectRatio: '3/4', maxWidth: '100%' }}>
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

              </div>
            </div>

            {/* Floor Stats Panel - Full width below building */}
            <div className="mt-3 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex-shrink-0">
              {/* Floor Selector Row */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                <button
                  onClick={handleFloorDown}
                  disabled={selectedFloor <= MIN_FLOOR}
                  className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:hover:bg-white transition-all flex items-center justify-center shadow-sm"
                >
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 tabular-nums">Floor {activeFloor || selectedFloor}</div>
                  <div className="text-xs text-slate-500">of {TOTAL_FLOORS} floors</div>
                </div>
                <button
                  onClick={handleFloorUp}
                  disabled={selectedFloor >= MAX_FLOOR}
                  className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-40 disabled:hover:bg-white transition-all flex items-center justify-center shadow-sm"
                >
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                {/* Available */}
                <div className="p-3 text-center bg-green-50/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">Available</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{getFloorStats(activeFloor || selectedFloor).available}</div>
                </div>
                {/* Reserved */}
                <div className="p-3 text-center bg-amber-50/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Reserved</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-600">{getFloorStats(activeFloor || selectedFloor).reserved}</div>
                </div>
                {/* Sold */}
                <div className="p-3 text-center bg-red-50/50">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Sold</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{getFloorStats(activeFloor || selectedFloor).sold}</div>
                </div>
              </div>
            </div>
            </>
          )}
        </div>

        {/* MIDDLE: Floor Plan - Full width on mobile, expands when left panel collapses on desktop */}
        <div className={cn(
          "flex-1 p-2 lg:p-4 flex flex-col bg-white transition-all duration-300 ease-out overflow-hidden",
          leftPanelCollapsed ? "lg:flex-1" : "lg:w-[72%] xl:w-[70%] 2xl:w-[68%]"
        )}>
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
          <div className="flex-1 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-2 overflow-hidden relative">
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
                        : getSuiteImage(selectedSuite.unit_number)}
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

                  {/* Image Tab Toggle - Switch between floor plan and interior */}
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={() => setActiveImageTab(activeImageTab === 'floorplan' ? 'interior' : 'floorplan')}
                      className="px-4 py-2.5 min-h-[44px] rounded-full text-sm font-semibold transition-all bg-white text-slate-900 shadow-md hover:bg-slate-50"
                    >
                      {activeImageTab === 'floorplan' ? '← View Interior' : '📐 View Floor Plan'}
                    </button>
                  </div>
                </div>


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

                  {/* Investment Price Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 mb-5 border border-amber-200">
                    <div className="text-xs font-medium text-amber-700 mb-1">Investment Price</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {formatPriceUSD(SUITE_PRICES[selectedSuite.unit_number])}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      ${PRICE_PER_SQM.toLocaleString()}/m² × {selectedSuite.size_sqm}m²
                    </div>
                    <PriceTierBar price={SUITE_PRICES[selectedSuite.unit_number]} />
                    <div className="mt-4 pt-4 border-t border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500" />
                        Qualifies for Investment Visa
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-500" />
                        Hotel Management Program
                      </div>
                    </div>
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
                      <div className="flex gap-3">
                        <a
                          href="/assets/Mercan-Group-Panama-Brochure.pdf"
                          download="Pullman-Panama-Brochure.pdf"
                          className="flex-1 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <Download className="w-4 h-4" />
                          Brochure
                        </a>
                        <button
                          onClick={handleShare}
                          className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98] relative"
                        >
                          <Share2 className="w-4 h-4" />
                          {shareMessage || 'Share'}
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
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-4 bg-black/60 lg:bg-black/50 lg:backdrop-blur-sm animate-fade-in"
            onClick={handleClosePanel}
          >
            <div
              className="bg-white w-full lg:rounded-2xl rounded-t-3xl shadow-2xl lg:max-w-6xl max-h-[95vh] lg:max-h-[80vh] overflow-hidden animate-modal-in relative"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Swipe Direction Indicators */}
              {swipeDirection && (
                <>
                  {swipeDirection === 'right' && getAdjacentSuites().prev && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 lg:hidden">
                      <div className="w-10 h-10 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg animate-pulse">
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  {swipeDirection === 'left' && getAdjacentSuites().next && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 lg:hidden">
                      <div className="w-10 h-10 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg animate-pulse">
                        <ChevronRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Suite Navigation Dots - Mobile */}
              <div className="lg:hidden absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
                {floorApartments.slice(0, 7).map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => {
                      setSelectedSuite(apt)
                      setActiveImageTab('floorplan')
                      setCurrentImageIndex(0)
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      apt.id === selectedSuite?.id
                        ? "bg-amber-400 w-4"
                        : "bg-white/50 hover:bg-white/80"
                    )}
                    aria-label={`Suite ${apt.unit_number}`}
                  />
                ))}
                {floorApartments.length > 7 && (
                  <span className="text-white/70 text-[10px] ml-1">+{floorApartments.length - 7}</span>
                )}
              </div>
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
                      {/* Main Image with blur-up loading */}
                      <div className="relative h-[200px] sm:h-[250px] lg:flex-1 lg:min-h-[300px] overflow-hidden">
                        {/* Blur placeholder */}
                        {!imageLoaded && (
                          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <img
                          src={currentImage}
                          alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                          loading="lazy"
                          onLoad={() => setImageLoaded(true)}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-300",
                            activeImageTab === 'floorplan' && "cursor-pointer hover:opacity-90 object-contain bg-white",
                            !imageLoaded && "opacity-0 scale-105",
                            imageLoaded && "opacity-100 scale-100"
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
                      <div className="text-slate-500 text-xs lg:text-sm font-medium">Investment Price</div>
                      <div className="text-xl lg:text-3xl font-bold text-slate-900">{formatPriceUSD(SUITE_PRICES[selectedSuite.unit_number])}</div>
                      <div className="text-xs text-slate-500 mt-0.5">${PRICE_PER_SQM.toLocaleString()}/m²</div>
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
                        <div className="flex gap-2">
                          <a
                            href="/assets/Mercan-Group-Panama-Brochure.pdf"
                            download="Pullman-Panama-Brochure.pdf"
                            className="flex-1 py-2.5 min-h-[44px] bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Brochure
                          </a>
                          <button
                            onClick={handleShare}
                            className="flex-1 py-2.5 min-h-[44px] bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            {shareMessage || 'Share'}
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
                          <div className="flex justify-between">
                            <span className="text-slate-500">View</span>
                            <span className="font-semibold text-slate-900">Ocean</span>
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
