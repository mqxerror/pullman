import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Maximize2, Building2, Check, Clock, Lock, Download, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getSuiteInfo, getSuiteType, SUITE_SIZES, SUITE_PRICES, formatPriceUSD, PRICE_PER_SQM, EXECUTIVE_SUITES } from '@/config/suiteData'

// Suite metadata helper (uses accurate data from suiteData.ts)
const getSuiteMetadata = (unitNumber: number): { size: number; type: string } => {
  const size = SUITE_SIZES[unitNumber] || 0
  const type = getSuiteType(size)
  return { size, type }
}

const statusConfig = {
  available: {
    icon: Check,
    label: 'Available',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  reserved: {
    icon: Clock,
    label: 'Reserved',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  sold: {
    icon: Lock,
    label: 'Sold',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-600',
    badgeBorder: 'border-red-200',
  },
}

// Get suite-specific images based on suite type
const getSuiteImages = (unitNumber: number): string[] => {
  const suiteInfo = EXECUTIVE_SUITES.find(s => s.unitNumber === unitNumber)
  const suiteType = suiteInfo?.type || 'A'

  // Define images for each suite type
  const typeImages: Record<string, string[]> = {
    'A': ['/assets/suites/executive-suite-type-a-suite-3.jpg'],
    'B': ['/assets/suites/standard-hotel-room.jpg'],
    'C': ['/assets/suites/executive-suite-type-c-suite-5.jpg'],
    'D': ['/assets/suites/executive-suite-type-c-suite-5.jpg'], // Use type C image as fallback
    'E': ['/assets/suites/executive-suite-type-e-suite-7.jpg', '/assets/suites/executive-suite-type-e-suite-8.jpg'],
    'Hotel': ['/assets/suites/standard-hotel-room.jpg'],
  }

  // Use specific rendering if available, otherwise use type-based images
  if (suiteInfo?.renderingFile) {
    return [suiteInfo.renderingFile]
  }

  return typeImages[suiteType] || ['/assets/suites/standard-hotel-room.jpg']
}

export default function SuiteDetailPage() {
  const { floor, unit } = useParams<{ floor: string; unit: string }>()
  const navigate = useNavigate()
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'floorplan'>('interior')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showFloorPlanFullscreen, setShowFloorPlanFullscreen] = useState(false)

  const floorNum = parseInt(floor || '17')
  const unitNum = parseInt(unit || '1')
  const suiteInfo = getSuiteMetadata(unitNum)
  const suiteImages = getSuiteImages(unitNum)

  // Fetch suite data
  const { data: suite, isLoading } = useQuery({
    queryKey: ['suite', floorNum, unitNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .eq('floor', floorNum)
        .eq('unit_number', unitNum)
        .single()

      if (error) throw error
      return data
    },
  })

  // Fetch similar suites
  const { data: similarSuites } = useQuery({
    queryKey: ['similar-suites', suiteInfo?.type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .eq('suite_type', suiteInfo?.type)
        .eq('status', 'available')
        .neq('unit_number', unitNum)
        .limit(4)

      if (error) throw error
      return data
    },
    enabled: !!suiteInfo?.type,
  })

  const status = (suite?.status || 'available') as keyof typeof statusConfig
  const config = statusConfig[status]
  const StatusIcon = config.icon

  // Get floor plan for this specific suite
  const suiteDetails = getSuiteInfo(unitNum)
  const floorPlanImage = suiteDetails?.floorPlanFile || '/assets/floorplans/pullman-plan.png'

  const currentImages = activeImageTab === 'interior' ? suiteImages :
                        [floorPlanImage]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Floor Plan</span>
          </button>

          <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-12" />

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <a
              href="/assets/Mercan-Group-Panama-Presentation.pdf"
              download="Mercan-Group-Panama-Presentation.pdf"
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Brochure
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Image Tabs */}
            <div className="flex gap-2">
              {(['interior', 'floorplan'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveImageTab(tab)
                    setCurrentImageIndex(0)
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                    activeImageTab === tab
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  )}
                >
                  {tab === 'floorplan' ? 'Floor Plan' : 'Interior'}
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={currentImages[currentImageIndex]}
                alt={`Suite ${floor}-${unit} ${activeImageTab}`}
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

              {/* Click to enlarge hint for floor plan */}
              {activeImageTab === 'floorplan' && (
                <div className="absolute top-4 right-4 px-3 py-2 bg-black/60 backdrop-blur text-white text-sm font-medium rounded-lg flex items-center gap-2 pointer-events-none">
                  <Maximize2 className="w-4 h-4" />
                  Click to enlarge
                </div>
              )}

              {/* Navigation Arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur text-white text-sm rounded-full">
                {currentImageIndex + 1} / {currentImages.length}
              </div>

              {/* Status Badge */}
              <div className={cn(
                'absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border',
                config.badgeBg,
                config.badgeText,
                config.badgeBorder
              )}>
                <StatusIcon className="w-4 h-4" />
                {config.label}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
                      currentImageIndex === idx ? 'border-gold-500' : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Suite Details */}
          <div className="space-y-6">
            {/* Suite Header */}
            <div>
              <h1 className="text-4xl font-bold text-slate-900 heading-display">
                Suite {floor}-{unit}
              </h1>
              <p className="text-xl text-slate-500 mt-1">{suiteInfo?.type || 'Executive Suite'}</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 text-center">
                <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-gold-600 mx-auto mb-1.5 md:mb-2" />
                <div className="text-lg md:text-2xl font-bold text-slate-900">{suiteInfo?.size || '--'}</div>
                <div className="text-xs md:text-sm text-slate-500">Sq. Meters</div>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 text-center">
                <Building2 className="w-5 h-5 md:w-6 md:h-6 text-gold-600 mx-auto mb-1.5 md:mb-2" />
                <div className="text-lg md:text-2xl font-bold text-slate-900">{floor}</div>
                <div className="text-xs md:text-sm text-slate-500">Floor Level</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
              <div className="text-sm text-slate-300 mb-1">Investment Price</div>
              <div className="text-3xl font-bold">{formatPriceUSD(SUITE_PRICES[unitNum])}</div>
              <div className="text-sm text-slate-400 mt-1">${PRICE_PER_SQM.toLocaleString()}/m² × {suiteInfo.size}m²</div>
            </div>

            {/* Suite Features */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Suite Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Floor-to-Ceiling Windows',
                  'Central Air Conditioning',
                  'Smart Home Ready',
                  'Premium Finishes',
                  'Gourmet Kitchen',
                  'Marble Bathrooms',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Amenities */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Hotel Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  '24/7 Room Service',
                  'Rooftop Pool Access',
                  'Casino Access',
                  '24/7 Security',
                  'Fitness Center',
                  'Valet Parking',
                  'Concierge Service',
                  'Spa & Wellness',
                ].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-slate-600">
                    <Check className="w-4 h-4 text-gold-500" />
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/building" className="flex-1 py-3.5 sm:py-4 bg-gold-600 text-white rounded-xl font-semibold hover:bg-gold-700 transition-all text-center text-sm sm:text-base">
                Explore More Units
              </Link>
              <Link to="/apartments" className="flex-1 py-3.5 sm:py-4 border-2 border-slate-900 text-slate-900 rounded-xl font-semibold hover:bg-slate-900 hover:text-white transition-all text-center text-sm sm:text-base">
                View All Apartments
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Suites */}
        {similarSuites && similarSuites.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Similar Suites</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {similarSuites.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/suite/${s.floor}/${s.unit_number}`)}
                  className="bg-white rounded-xl p-4 border border-slate-200 text-left hover:border-gold-300 hover:shadow-lg transition-all group"
                >
                  <div className="text-lg font-semibold text-slate-900 group-hover:text-gold-600 transition-colors">
                    Suite {s.floor}-{s.unit_number}
                  </div>
                  <div className="text-sm text-slate-500">{s.size_sqm} m²</div>
                  <div className="mt-2 text-xs text-emerald-600 font-medium">Available</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Fullscreen Floor Plan Modal */}
      {showFloorPlanFullscreen && (
        <div
          className="fixed inset-0 bg-white z-[60] flex items-center justify-center"
          onClick={() => setShowFloorPlanFullscreen(false)}
        >
          <button
            onClick={() => setShowFloorPlanFullscreen(false)}
            className="absolute top-4 right-4 p-3 bg-slate-900 text-white rounded-full shadow-lg z-10 hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full h-full overflow-auto p-4 flex items-center justify-center">
            <img
              src={floorPlanImage}
              alt="Floor plan fullscreen"
              className="max-w-none w-[150vw] sm:w-[120vw] lg:w-auto lg:max-h-[90vh]"
              style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
