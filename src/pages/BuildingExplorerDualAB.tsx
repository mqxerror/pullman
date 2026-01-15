import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import {
  Menu, X, Maximize2, Building2, Check, Clock, Lock, ChevronUp, ChevronDown,
  X as CloseIcon, ArrowRight, Bed, Bath, Mountain, Download, Share2, Phone,
  ChevronLeft, Sparkles, Star, Wifi, Car, Dumbbell, Coffee, Shield, Waves
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
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-12 w-auto" />
          </Link>

          {/* A/B Test Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => { setViewMode('A'); setSelectedSuite(null); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'A' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              A: Slide Panel
            </button>
            <button
              onClick={() => { setViewMode('B'); setSelectedSuite(null); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'B' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              B: Full Page
            </button>
            <button
              onClick={() => { setViewMode('C'); setSelectedSuite(null); }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                viewMode === 'C' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              C: Large Modal
            </button>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/building-dual" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Original</Link>
            <span className="text-sm text-slate-900 font-medium border-b-2 border-gold-500 pb-0.5">A/B Test</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row relative">
        {/* LEFT: Tower Building - Shrinks when panel open in Option A */}
        <div className={cn(
          "p-6 flex flex-col border-r border-slate-200/50 bg-gradient-to-b from-white to-slate-50 transition-all duration-500",
          viewMode === 'A' && selectedSuite ? "lg:w-[25%]" : "lg:w-[35%]"
        )}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold heading-display text-slate-900">Select Floor</h2>
            <p className="text-sm text-gold-600 mt-1">Click on the building to choose a floor</p>
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="relative h-full max-h-[600px] aspect-[3/4] w-full max-w-[400px]">
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
        </div>

        {/* MIDDLE: Floor Plan - Shrinks when panel open in Option A */}
        <div className={cn(
          "p-6 flex flex-col bg-white transition-all duration-500",
          viewMode === 'A' && selectedSuite ? "lg:w-[35%]" : "lg:w-[65%]"
        )}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className={cn(
                "font-bold heading-display text-slate-900 transition-all",
                viewMode === 'A' && selectedSuite ? "text-lg" : "text-2xl"
              )}>Floor {selectedFloor} Layout</h2>
              <p className="text-sm text-slate-500 mt-1">
                Click on any suite to view details
              </p>
            </div>
            {/* Legend - hide when panel open */}
            {!(viewMode === 'A' && selectedSuite) && (
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
            )}
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

        {/* OPTION A: Enhanced Slide-in Detail Panel */}
        {viewMode === 'A' && selectedSuite && (
          <div className="lg:w-[40%] bg-white border-l border-slate-200 shadow-2xl overflow-y-auto animate-slide-in-right">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between">
              <button
                onClick={handleClosePanel}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">Back to Floor Plan</span>
              </button>
              <span className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm',
                selectedSuite.status === 'available' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                selectedSuite.status === 'reserved' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              )}>
                {(() => {
                  const StatusIcon = statusConfig[selectedSuite.status].icon
                  return <StatusIcon className="w-4 h-4" />
                })()}
                {statusConfig[selectedSuite.status].label}
              </span>
            </div>

            {/* Hero Image Section */}
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                <img
                  src={activeImageTab === 'floorplan'
                    ? getFloorPlanImage(selectedSuite.unit_number)
                    : activeImageTab === 'views'
                    ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
                    : getSuiteImages(selectedSuite.unit_number)[0]}
                  alt={`Suite ${activeImageTab}`}
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Image Navigation Arrows */}
                {activeImageTab !== 'floorplan' && (
                  <>
                    <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-105">
                      <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all hover:scale-105">
                      <ArrowRight className="w-5 h-5 text-slate-700" />
                    </button>
                  </>
                )}

                {/* Suite Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-3xl font-bold text-white heading-display drop-shadow-lg">
                    Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                  </h2>
                  <p className="text-gold-300 text-lg mt-1 drop-shadow-md">{getSuiteType(selectedSuite.size_sqm)}</p>
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur text-white text-sm rounded-full">
                  1 / 3
                </div>
              </div>

              {/* Image Tabs */}
              <div className="absolute top-4 left-4 flex gap-2">
                {['interior', 'views', 'floorplan'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveImageTab(tab as any)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize shadow-sm',
                      activeImageTab === tab
                        ? 'bg-white text-slate-900'
                        : 'bg-black/30 backdrop-blur text-white hover:bg-black/50'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {activeImageTab !== 'floorplan' && (
              <div className="flex gap-2 p-3 bg-slate-50 border-b border-slate-200">
                {getSuiteImages(selectedSuite.unit_number).map((img, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                      idx === 0 ? 'border-gold-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Panel Content */}
            <div className="p-6">
              {/* Quick Stats - Enhanced Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <Maximize2 className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{selectedSuite.size_sqm}</div>
                  <div className="text-xs text-slate-500 font-medium">Square Meters</div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <Building2 className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{selectedSuite.floor}</div>
                  <div className="text-xs text-slate-500 font-medium">Floor Level</div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <Mountain className="w-5 h-5 text-gold-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">Ocean</div>
                  <div className="text-xs text-slate-500 font-medium">View Type</div>
                </div>
              </div>

              {/* Price Card - Enhanced */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-5 mb-6 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative">
                  <div className="text-slate-400 text-sm">Starting from</div>
                  <div className="text-3xl font-bold text-white mt-1">Contact for Pricing</div>
                  <div className="text-gold-400 text-sm mt-2">Flexible payment plans available</div>
                </div>
              </div>

              {/* Features & Amenities - Side by Side */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Suite Features */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-500" />
                    Suite Features
                  </h3>
                  <div className="space-y-2.5">
                    {SUITE_FEATURES.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm">{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Amenities */}
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold-500" />
                    Hotel Amenities
                  </h3>
                  <div className="space-y-2.5">
                    {HOTEL_AMENITIES.slice(0, 3).map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-slate-600">
                        <Check className="w-4 h-4 text-gold-500 flex-shrink-0" />
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                    ))}
                    <button className="text-sm text-gold-600 font-medium hover:text-gold-700 transition-colors">
                      +3 more amenities
                    </button>
                  </div>
                </div>
              </div>

              {/* CTAs - Enhanced */}
              {selectedSuite.status !== 'sold' && (
                <div className="space-y-3">
                  <button className="w-full py-4 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/25 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-gold-500/30 hover:-translate-y-0.5">
                    <Phone className="w-5 h-5" />
                    Schedule a Viewing
                  </button>
                  <div className="flex gap-3">
                    <button className="flex-1 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Brochure
                    </button>
                    <button className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}

              {/* Similar Suites - Enhanced */}
              {similarSuites.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gold-500" />
                    Similar Suites Available
                  </h3>
                  <div className="space-y-2">
                    {similarSuites.slice(0, 3).map((suite) => (
                      <button
                        key={suite.id}
                        onClick={() => setSelectedSuite(suite)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-gold-300 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                            <img
                              src={getSuiteImage(suite.unit_number)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-gold-600 transition-colors">
                              Suite {suite.floor}-{suite.unit_number}
                            </div>
                            <div className="text-sm text-slate-500">{suite.size_sqm} m² · Floor {suite.floor}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OPTION C: Large Modal Overlay */}
        {viewMode === 'C' && selectedSuite && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={handleClosePanel}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-full max-h-[90vh]">
                {/* Left: Image Gallery */}
                <div className="w-1/2 bg-slate-900 relative">
                  <img
                    src={activeImageTab === 'floorplan' ? getFloorPlanImage(selectedSuite.unit_number) : getSuiteImage(selectedSuite.unit_number)}
                    alt={`Suite ${selectedSuite.floor}-${selectedSuite.unit_number}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Image Tabs */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {['interior', 'views', 'floorplan'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveImageTab(tab as any)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                          activeImageTab === tab ? 'bg-white text-slate-900' : 'bg-white/20 text-white hover:bg-white/30'
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Suite Name Overlay */}
                  <div className="absolute bottom-6 left-6">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mb-3',
                      selectedSuite.status === 'available' ? 'bg-green-500 text-white' :
                      selectedSuite.status === 'reserved' ? 'bg-gold-500 text-white' :
                      'bg-slate-500 text-white'
                    )}>
                      {statusConfig[selectedSuite.status].label}
                    </span>
                    <h2 className="text-4xl font-bold text-white heading-display">
                      Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                    </h2>
                    <p className="text-gold-300 text-xl mt-1">{getSuiteType(selectedSuite.size_sqm)}</p>
                  </div>
                </div>

                {/* Right: Details */}
                <div className="w-1/2 overflow-y-auto">
                  <div className="sticky top-0 bg-white z-10 p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-slate-400 text-sm">Starting from</div>
                      <div className="text-2xl font-bold text-slate-900">Contact for Pricing</div>
                    </div>
                    <button
                      onClick={handleClosePanel}
                      className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
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

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Suite Features</h3>
                        <div className="space-y-3">
                          {SUITE_FEATURES.map((feature, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-700">
                              <feature.icon className="w-5 h-5 text-gold-500" />
                              <span>{feature.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Hotel Amenities</h3>
                        <div className="space-y-3">
                          {HOTEL_AMENITIES.slice(0, 4).map((amenity, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-700">
                              <amenity.icon className="w-5 h-5 text-gold-500" />
                              <span>{amenity.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CTAs */}
                    {selectedSuite.status !== 'sold' && (
                      <div className="space-y-3">
                        <button className="w-full py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-light transition-colors flex items-center justify-center gap-2">
                          <Download className="w-5 h-5" />
                          Download Brochure
                        </button>
                        <div className="flex gap-3">
                          <button className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <button className="flex-1 py-3 bg-gold-500 text-white font-medium rounded-xl hover:bg-gold-600 transition-colors flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact Sales
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Similar Suites */}
                    {similarSuites.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Similar Suites</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {similarSuites.slice(0, 4).map((suite) => (
                            <button
                              key={suite.id}
                              onClick={() => setSelectedSuite(suite)}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
                            >
                              <div>
                                <div className="font-medium text-slate-900">Suite {suite.floor}-{suite.unit_number}</div>
                                <div className="text-sm text-slate-500">{suite.size_sqm} m²</div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
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
