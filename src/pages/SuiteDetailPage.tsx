import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Maximize2, Building2, Compass, Check, Clock, Lock, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// Suite metadata
const SUITE_DATA: Record<number, { size: number; type: string }> = {
  1: { size: 85.15, type: 'Premium Suite' },
  2: { size: 53.35, type: 'Executive Suite' },
  3: { size: 54.30, type: 'Executive Suite' },
  4: { size: 56.80, type: 'Executive Suite' },
  5: { size: 63.80, type: 'Deluxe Suite' },
  6: { size: 74.46, type: 'Deluxe Suite' },
  7: { size: 65.55, type: 'Deluxe Suite' },
  8: { size: 64.53, type: 'Deluxe Suite' },
  9: { size: 82.25, type: 'Premium Suite' },
  10: { size: 64.53, type: 'Deluxe Suite' },
  11: { size: 65.55, type: 'Deluxe Suite' },
  12: { size: 74.46, type: 'Deluxe Suite' },
  13: { size: 63.80, type: 'Deluxe Suite' },
  14: { size: 56.80, type: 'Executive Suite' },
  15: { size: 54.30, type: 'Executive Suite' },
  16: { size: 53.35, type: 'Executive Suite' },
  17: { size: 85.15, type: 'Premium Suite' },
  18: { size: 53.53, type: 'Executive Suite' },
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

const suiteImages = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
]

const viewImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
]

export default function SuiteDetailPage() {
  const { floor, unit } = useParams<{ floor: string; unit: string }>()
  const navigate = useNavigate()
  const [activeImageTab, setActiveImageTab] = useState<'interior' | 'views' | 'floorplan'>('interior')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const floorNum = parseInt(floor || '17')
  const unitNum = parseInt(unit || '1')
  const suiteInfo = SUITE_DATA[unitNum]

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

  const currentImages = activeImageTab === 'interior' ? suiteImages :
                        activeImageTab === 'views' ? viewImages :
                        ['/assets/floorplans/pullman-plan.png']

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
            <button className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-all">
              <Download className="w-4 h-4" />
              Download Brochure
            </button>
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
              {(['interior', 'views', 'floorplan'] as const).map((tab) => (
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
                  {tab}
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200">
              <img
                src={currentImages[currentImageIndex]}
                alt={`Suite ${floor}-${unit} ${activeImageTab}`}
                className="w-full h-full object-cover"
              />

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
            <div className="grid grid-cols-3 gap-2 md:gap-4">
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
              <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 text-center">
                <Compass className="w-5 h-5 md:w-6 md:h-6 text-gold-600 mx-auto mb-1.5 md:mb-2" />
                <div className="text-lg md:text-2xl font-bold text-slate-900">Ocean</div>
                <div className="text-xs md:text-sm text-slate-500">View</div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
              <div className="text-sm text-slate-300 mb-1">Starting from</div>
              <div className="text-3xl font-bold">Contact for Pricing</div>
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
    </div>
  )
}
