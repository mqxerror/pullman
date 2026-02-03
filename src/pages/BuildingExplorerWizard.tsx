/**
 * BuildingExplorerWizard - Step Wizard Variant
 *
 * A/B Test variant focusing on small laptop experience:
 * - Step 1: Full-screen building view to select floor
 * - Step 2: Full-screen floor plan to select unit
 * - Step 3: Unit detail modal/drawer
 *
 * Each step gets maximum screen real estate.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import {
  X, Maximize2, Check, Clock, Lock, ChevronUp, ChevronDown,
  ArrowRight, Bed, ArrowLeft, Home, ChevronRight,
  Sparkles, Wifi, Coffee, Shield, Dumbbell, Car, Star, Waves
} from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR, TOTAL_FLOORS, isAmenityFloor, AMENITY_FLOOR_LABELS } from '@/config/building'
import { getSuiteInfo, getSuiteImage, SUITE_PRICES, formatPriceUSD, PRICE_PER_SQM } from '@/config/suiteData'
import { cn } from '@/lib/utils'
import FloorPlanSVG from '@/components/FloorPlanSVG'
import BuildingFacadeSVG from '@/components/BuildingFacadeSVG'
import TourGuide from '@/components/TourGuide'

type WizardStep = 'building' | 'floorplan'

// Helper to get floor plan for specific unit
const getFloorPlanImage = (unitNumber: number): string => {
  const suiteInfo = getSuiteInfo(unitNumber)
  return suiteInfo?.floorPlanFile || '/assets/floorplans/floor-overview.png'
}

const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-green-600', bg: 'bg-green-500', bgLight: 'bg-green-50' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-amber-600', bg: 'bg-amber-500', bgLight: 'bg-amber-50' },
  sold: { icon: Lock, label: 'Sold', color: 'text-red-600', bg: 'bg-red-500', bgLight: 'bg-red-50' },
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

export default function BuildingExplorerWizard() {
  const [step, setStep] = useState<WizardStep>('building')
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)
  const [selectedSuite, setSelectedSuite] = useState<ExecutiveSuite | null>(null)
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'floorplan'>('floorplan')
  const [showFloorPlanFullscreen, setShowFloorPlanFullscreen] = useState(false)

  // Fetch suites data
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

  const activeFloor = hoveredFloor || selectedFloor

  // Handle floor selection -> go to floor plan
  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor)
    if (!isAmenityFloor(floor)) {
      setStep('floorplan')
    }
  }

  // Handle suite click -> open modal
  const handleSuiteClick = (suite: ExecutiveSuite) => {
    setSelectedSuite(suite)
    setActiveImageTab('floorplan')
  }

  // Close suite modal
  const handleCloseModal = useCallback(() => {
    setSelectedSuite(null)
  }, [])

  // Back to building view
  const handleBackToBuilding = () => {
    setStep('building')
    setSelectedSuite(null)
  }

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSuite) {
          handleCloseModal()
        } else if (step === 'floorplan') {
          handleBackToBuilding()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedSuite, step, handleCloseModal])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedSuite) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [selectedSuite])

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Compact Header */}
      <header className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan" className="h-8" />
            </Link>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm ml-3 pl-3 border-l border-slate-200">
              <Link to="/" className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <button
                onClick={handleBackToBuilding}
                className={cn(
                  "transition-colors",
                  step === 'building' ? "text-slate-900 font-medium" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Building
              </button>
              {step === 'floorplan' && (
                <>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                  <span className="text-amber-600 font-medium">Floor {selectedFloor}</span>
                </>
              )}
            </nav>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            <Link to="/apartments" className="text-sm text-slate-600 hover:text-slate-900">Apartments</Link>
            <Link to="/location" className="text-sm text-slate-600 hover:text-slate-900">Location</Link>
            <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900">About</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* ============================================
            STEP 1: BUILDING VIEW - Full Screen
            ============================================ */}
        {step === 'building' && (
          <div className="h-full flex flex-col lg:flex-row">
            {/* Building Visualization - Takes most space */}
            <div className="flex-1 flex items-center justify-center p-2 lg:p-6 bg-gradient-to-br from-slate-100 to-stone-100 overflow-hidden">
              <div data-tour="building-image" className="relative h-full max-h-[90vh] w-auto flex flex-col items-center">
                <BuildingFacadeSVG
                  selectedFloor={selectedFloor}
                  hoveredFloor={hoveredFloor}
                  onFloorSelect={handleFloorSelect}
                  onFloorHover={setHoveredFloor}
                  className="h-full w-auto"
                />

                {/* Floor indicator pill - bottom */}
                <div className="mt-3 bg-white rounded-full shadow-lg px-4 py-2 border border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Floor {activeFloor}</span>
                </div>
              </div>
            </div>

            {/* Right Panel - Floor Info & Stats */}
            <div className="lg:w-80 xl:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 p-4 lg:p-6 flex flex-col">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Select a Floor</h2>
                  <p className="text-sm text-slate-500 mt-1">Click on the building to explore</p>
                </div>
                <TourGuide tourId="buildingWizard" variant="icon" />
              </div>

              {/* Floor Navigator */}
              <div data-tour="floor-navigator" className="flex items-center justify-between bg-slate-50 rounded-xl p-3 mb-4">
                <button
                  onClick={() => setSelectedFloor(Math.max(MIN_FLOOR, selectedFloor - 1))}
                  disabled={selectedFloor <= MIN_FLOOR}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{activeFloor}</div>
                  <div className="text-xs text-slate-500">of {TOTAL_FLOORS} floors</div>
                </div>
                <button
                  onClick={() => setSelectedFloor(Math.min(MAX_FLOOR, selectedFloor + 1))}
                  disabled={selectedFloor >= MAX_FLOOR}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-amber-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              {/* Floor Stats */}
              {!isAmenityFloor(activeFloor) ? (
                <div data-tour="floor-stats" className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{getFloorStats(activeFloor).available}</div>
                    <div className="text-xs text-green-700 font-medium">Available</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-xl">
                    <div className="text-2xl font-bold text-amber-600">{getFloorStats(activeFloor).reserved}</div>
                    <div className="text-xs text-amber-700 font-medium">Reserved</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">{getFloorStats(activeFloor).sold}</div>
                    <div className="text-xs text-red-700 font-medium">Sold</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-xl mb-6">
                  <div className="flex items-center gap-3">
                    {activeFloor === 27 ? <Coffee className="w-6 h-6 text-blue-600" /> : <Waves className="w-6 h-6 text-blue-600" />}
                    <div>
                      <div className="font-semibold text-blue-900">{AMENITY_FLOOR_LABELS[activeFloor]}</div>
                      <div className="text-xs text-blue-700">Exclusive amenity floor</div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {!isAmenityFloor(activeFloor) && (
                <button
                  data-tour="view-floor-plan"
                  onClick={() => setStep('floorplan')}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                >
                  View Floor Plan
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}

              {/* Legend */}
              <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-2 font-medium">Legend</div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500" />
                    <span className="text-xs text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-amber-100 border-2 border-amber-500" />
                    <span className="text-xs text-slate-600">Reserved</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-500" />
                    <span className="text-xs text-slate-600">Sold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            STEP 2: FLOOR PLAN VIEW - Full Screen
            ============================================ */}
        {step === 'floorplan' && (
          <div className="h-full flex flex-col">
            {/* Floor Plan Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <button
                onClick={handleBackToBuilding}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Change Floor</span>
              </button>

              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900">Floor {selectedFloor}</h2>
                <p className="text-xs text-slate-500">{floorApartments.length} units • Tap to view details</p>
              </div>

              {/* Legend */}
              <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-100 border-2 border-green-500" />
                  <span className="text-xs text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-100 border-2 border-amber-500" />
                  <span className="text-xs text-slate-600">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-100 border-2 border-red-500" />
                  <span className="text-xs text-slate-600">Sold</span>
                </div>
              </div>
            </div>

            {/* Floor Plan - Full remaining space */}
            <div className="flex-1 bg-gradient-to-br from-slate-50 to-white p-2 sm:p-4 overflow-hidden">
              <div className="h-full w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                <FloorPlanSVG
                  floor={selectedFloor}
                  suites={floorApartments}
                  onSuiteClick={handleSuiteClick}
                  selectedSuiteId={selectedSuite?.id}
                />
              </div>
            </div>

            {/* Mobile: Quick Floor Switcher */}
            <div className="flex-shrink-0 sm:hidden bg-white border-t border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedFloor(Math.max(MIN_FLOOR, selectedFloor - 1))}
                  disabled={selectedFloor <= MIN_FLOOR}
                  className="p-3 rounded-xl bg-slate-100 disabled:opacity-40"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <span className="text-lg font-bold">Floor {selectedFloor}</span>
                  <span className="text-sm text-slate-500 ml-2">({getFloorStats(selectedFloor).available} available)</span>
                </div>
                <button
                  onClick={() => setSelectedFloor(Math.min(MAX_FLOOR, selectedFloor + 1))}
                  disabled={selectedFloor >= MAX_FLOOR}
                  className="p-3 rounded-xl bg-slate-100 disabled:opacity-40"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================
          SUITE DETAIL MODAL - Drawer from right
          ============================================ */}
      {selectedSuite && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={handleCloseModal}
          />

          {/* Modal */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] lg:w-[480px] bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <button
                onClick={handleCloseModal}
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
                onClick={handleCloseModal}
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
                {/* Title & Stats */}
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Suite {selectedSuite.floor}-{selectedSuite.unit_number}
                  </h3>
                  <p className="text-slate-500">
                    {getSuiteInfo(selectedSuite.unit_number)?.type || 'Executive Suite'}
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

      {/* Fullscreen Floor Plan */}
      {showFloorPlanFullscreen && selectedSuite && (
        <div
          className="fixed inset-0 bg-white z-[60] flex items-center justify-center"
          onClick={() => setShowFloorPlanFullscreen(false)}
        >
          <button
            onClick={() => setShowFloorPlanFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-slate-900 text-white rounded-full shadow-lg z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
            <img
              src={getFloorPlanImage(selectedSuite.unit_number)}
              alt="Floor plan"
              className="max-w-none w-[150vw] sm:w-[120vw] lg:w-auto lg:max-h-[90vh]"
              style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
