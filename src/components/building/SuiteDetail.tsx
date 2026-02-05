import { useState } from 'react'
import { ArrowLeft, Check, Clock, Lock, Maximize2, Share2, Download, X, Building2, Sun, Wind, Wifi, Shield, Waves, ChevronRight, Expand, Image, ChevronDown, Utensils, Dumbbell, Car, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ExecutiveSuite } from '@/types/database'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface SuiteDetailProps {
  suite: ExecutiveSuite
  onBack: () => void
  allSuites?: ExecutiveSuite[]
}

type MediaType = 'render' | 'view' | 'floorplan'

// Get suite type based on size
const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

// Get estimated price
const getEstimatedPrice = (floor: number, sizeSqm: number): number => {
  const basePrice = 4000 // USD per sqm
  const floorPremium = (floor - 17) * 100 // Premium for higher floors
  return (basePrice + floorPremium) * sizeSqm
}

const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(2)}M`
  }
  return `$${Math.round(price / 1000)}K`
}


// Get suite image based on unit number
const getSuiteImage = (unitNumber: number): string => {
  // Larger units use type-07, others use type-08
  if ([2, 7, 9, 11].includes(unitNumber)) {
    return '/assets/gallery/suite-type-07.jpg'
  }
  return '/assets/gallery/suite-type-08.jpg'
}

const statusConfig = {
  available: {
    icon: Check,
    label: 'Available',
    badgeClass: 'badge-premium-available',
    dotClass: 'bg-green-500',
    availabilityText: 'Available for purchase',
  },
  reserved: {
    icon: Clock,
    label: 'Reserved',
    badgeClass: 'badge-premium-reserved',
    dotClass: 'bg-gold-500',
    availabilityText: 'Under reservation',
  },
  sold: {
    icon: Lock,
    label: 'Sold',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
    dotClass: 'bg-slate-400',
    availabilityText: 'Sold',
  },
}

// Suite amenities
const suiteFeatures = [
  { icon: Sun, label: 'Floor-to-Ceiling Windows' },
  { icon: Wind, label: 'Central Air Conditioning' },
  { icon: Wifi, label: 'Smart Home Ready' },
]

const hotelFeatures = [
  { icon: Utensils, label: '24/7 Room Service' },
  { icon: Waves, label: 'Rooftop Pool Access' },
  { icon: Sparkles, label: 'Casino Access' },
  { icon: Shield, label: '24/7 Security' },
  { icon: Dumbbell, label: 'Fitness Center' },
  { icon: Car, label: 'Valet Parking' },
]

export default function SuiteDetail({ suite, onBack }: SuiteDetailProps) {
  const [activeMedia, setActiveMedia] = useState<MediaType>('render')
  const [showModal, setShowModal] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<'suite' | 'hotel' | null>('suite')

  const config = statusConfig[suite.status]
  const suiteType = getSuiteType(suite.size_sqm)
  const price = suite.price_usd || getEstimatedPrice(suite.floor, suite.size_sqm)
  const suiteImage = getSuiteImage(suite.unit_number)
  const StatusIcon = config.icon

  return (
    <>
      <div className="h-full overflow-y-auto bg-white">
        <div className="page-container py-4">
          {/* ROW 0: Breadcrumb + Title */}
          <div className="grid-12 mb-4">
            <div className="col-12">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs mb-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400">Panama City Central</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-400">Floor {suite.floor}</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-600 font-medium">Suite {suite.unit_number}</span>
              </div>

              {/* Title + Status */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl text-slate-900 heading-display">
                    Suite {suite.floor}-{suite.unit_number}
                  </h1>
                  <p className="text-sm text-gold-600 font-medium mt-1">{suiteType}</p>
                </div>
                <div className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                  config.badgeClass
                )}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{config.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 1: Key Stats Strip */}
          <div className="grid-12 mb-4">
            <div className="col-12">
              <div className="flex items-center gap-3 flex-wrap">
                <StatChip
                  icon={<Maximize2 className="w-4 h-4" />}
                  label="Size"
                  value={`${suite.size_sqm} m²`}
                />
                <StatChip
                  icon={<Building2 className="w-4 h-4" />}
                  label="Floor"
                  value={String(suite.floor)}
                />
              </div>
            </div>
          </div>

          {/* ROW 2: Hero Media (8 cols) + Actions Sidebar (4 cols) */}
          <div className="grid-12 mb-4">
            {/* Hero Media - 8 cols */}
            <div className="col-8">
              <div
                className="w-full relative overflow-hidden rounded-xl group cursor-pointer"
                style={{ height: 'clamp(360px, 52vh, 560px)' }}
              >
                {/* Media content - clickable to open modal */}
                <div onClick={() => setShowModal(true)} className="w-full h-full">
                  {activeMedia === 'render' && (
                    <img
                      src={suiteImage}
                      alt="Suite interior"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  )}
                  {activeMedia === 'view' && (
                    <img
                      src="/assets/gallery/rooftop-pool.jpg"
                      alt="View from suite"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  )}
                  {activeMedia === 'floorplan' && (
                    <div className="w-full h-full bg-gradient-to-br from-white via-white to-gold-50 flex items-center justify-center p-6">
                      {suite.floor_plan_url ? (
                        <div className="floorplan-reveal w-full h-full flex items-center justify-center">
                          <img
                            src={suite.floor_plan_url}
                            alt={`Suite ${suite.unit_number} floor plan`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-premium"
                          />
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Image className="w-7 h-7 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">Floorplan Coming Soon</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Top-left: Media tabs */}
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-lg p-1">
                  {(['render', 'view', 'floorplan'] as MediaType[]).map((type) => (
                    <button
                      key={type}
                      onClick={(e) => { e.stopPropagation(); setActiveMedia(type); }}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                        activeMedia === type
                          ? 'bg-white text-slate-900'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      )}
                    >
                      {type === 'render' ? 'Interior' : type === 'view' ? 'View' : 'Floorplan'}
                    </button>
                  ))}
                </div>

                {/* Top-right: Fullscreen */}
                <div className="absolute top-3 right-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg text-white hover:bg-black/60 transition-colors">
                    <Expand className="w-5 h-5" />
                  </span>
                </div>

                {/* Bottom-left: Current media label */}
                <div className="absolute bottom-3 left-3">
                  <span className="text-white text-sm font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                    {activeMedia === 'render' && 'Suite Interior'}
                    {activeMedia === 'view' && 'Rooftop View'}
                    {activeMedia === 'floorplan' && 'Floorplan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Sidebar - 4 cols */}
            <div className="col-4">
              <div className="sticky top-4 bg-white rounded-xl gold-border overflow-hidden shadow-lg">
                {/* Price Header */}
                <div className="p-5 border-b border-slate-100 bg-gold-subtle">
                  <p className="text-xs text-gold-700 uppercase tracking-wider font-medium mb-1">
                    {suite.status === 'sold' ? 'Sold at' : 'Starting From'}
                  </p>
                  <p className="text-3xl price-premium">
                    <span className="price-currency">USD </span>
                    {suite.price_display || formatPrice(price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-5 space-y-3">
                  <a
                    href="/assets/Mercan-Group-Panama-Presentation.pdf"
                    download="Mercan-Group-Panama-Presentation.pdf"
                    className="w-full btn-cta-premium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Brochure
                  </a>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/building?floor=${suite.floor}&unit=${suite.id}`
                      navigator.clipboard.writeText(url)
                      toast.success('Link copied to clipboard!')
                    }}
                    className="w-full py-3 px-4 bg-transparent border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Suite
                  </button>
                  <Link
                    to="/apartments"
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    View All Units
                  </Link>
                </div>

                {/* Status */}
                <div className="px-5 pb-5 pt-2">
                  <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-lg">
                    <div className={cn('w-2 h-2 rounded-full', config.dotClass)} />
                    <span className="text-xs text-slate-500">{config.availabilityText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 3: Thumbnails (8 cols) + Features (4 cols) */}
          <div className="grid-12 mb-6">
            {/* Thumbnails - 8 cols */}
            <div className="col-8">
              <div className="grid grid-cols-3 gap-3">
                {/* Interior thumbnail */}
                <button
                  onClick={() => setActiveMedia('render')}
                  className={cn(
                    'aspect-[4/3] rounded-xl overflow-hidden relative',
                    activeMedia === 'render' ? 'ring-2 ring-amber-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src={suiteImage}
                    alt="Interior"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
                    <span className="text-xs text-white font-medium">Interior</span>
                  </div>
                </button>

                {/* View thumbnail */}
                <button
                  onClick={() => setActiveMedia('view')}
                  className={cn(
                    'aspect-[4/3] rounded-xl overflow-hidden relative',
                    activeMedia === 'view' ? 'ring-2 ring-amber-500 ring-offset-2' : 'opacity-70 hover:opacity-100'
                  )}
                >
                  <img
                    src="/assets/gallery/rooftop-pool.jpg"
                    alt="View"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
                    <span className="text-xs text-white font-medium">View</span>
                  </div>
                </button>

                {/* Floorplan thumbnail */}
                <button
                  onClick={() => setActiveMedia('floorplan')}
                  className={cn(
                    'aspect-[4/3] rounded-xl overflow-hidden relative border',
                    activeMedia === 'floorplan'
                      ? 'ring-2 ring-amber-500 ring-offset-2 bg-slate-100 border-slate-200'
                      : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100'
                  )}
                >
                  {suite.floor_plan_url ? (
                    <>
                      <img
                        src={suite.floor_plan_url}
                        alt="Floorplan"
                        className="w-full h-full object-contain p-2 bg-white"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent py-2 px-3">
                        <span className="text-xs text-white font-medium">Floorplan</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center mb-2">
                          <Image className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">Floorplan</span>
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 rounded text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                        Soon
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features - 4 cols */}
            <div className="col-4 space-y-3">
              {/* Suite Features */}
              <FeatureCard
                title="Suite Features"
                features={suiteFeatures}
                expanded={expandedSection === 'suite'}
                onToggle={() => setExpandedSection(expandedSection === 'suite' ? null : 'suite')}
              />

              {/* Hotel Amenities */}
              <FeatureCard
                title="Hotel Amenities"
                features={hotelFeatures}
                expanded={expandedSection === 'hotel'}
                onToggle={() => setExpandedSection(expandedSection === 'hotel' ? null : 'hotel')}
              />
            </div>
          </div>

          {/* Bottom spacer for mobile fixed bar */}
          <div className="h-20 xl:hidden" />
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center gap-3 xl:hidden z-40">
        <div className="flex-1">
          <p className="text-xs text-slate-400">From</p>
          <p className="text-lg text-slate-900 font-bold">{suite.price_display || formatPrice(price)}</p>
        </div>
        <Link to="/apartments" className="flex-1 py-3 px-4 bg-amber-500 text-slate-900 text-sm font-medium rounded-xl flex items-center justify-center gap-2">
          <Building2 className="w-4 h-4" />
          All Units
        </Link>
        <button className="w-12 h-12 flex items-center justify-center border border-slate-200 rounded-xl">
          <Share2 className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Fullscreen Floor Plan Zoom — pinch-to-zoom enabled */}
      {showFullscreen && suite.floor_plan_url && (
        <div
          className="fixed inset-0 z-[60] bg-white flex flex-col"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="flex items-center justify-between p-3 border-b border-slate-200 flex-shrink-0">
            <p className="text-sm text-slate-500">Pinch or scroll to zoom</p>
            <button
              onClick={() => setShowFullscreen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <div
            className="flex-1 overflow-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <img
              src={suite.floor_plan_url}
              alt={`Suite ${suite.unit_number} floor plan`}
              className="w-[200vw] md:w-[150vw] max-w-none h-auto mx-auto"
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 md:p-6"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex flex-col"
            style={{ maxHeight: 'calc(100vh - 48px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
              <div>
                <h3 className="text-lg text-slate-900 font-semibold">
                  Suite {suite.floor}-{suite.unit_number}
                </h3>
                <p className="text-xs text-slate-400">{suiteType} • {suite.size_sqm} m²</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activeMedia === 'render' ? suiteImage : activeMedia === 'view' ? '/assets/gallery/rooftop-pool.jpg' : '#'}
                  download={`Suite-${suite.floor}-${suite.unit_number}-${activeMedia}.jpg`}
                  className="py-2 px-3 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 min-h-0 relative overflow-hidden bg-slate-900">
              {activeMedia === 'render' && (
                <img
                  src={suiteImage}
                  alt="Suite interior"
                  className="w-full h-full object-contain"
                />
              )}
              {activeMedia === 'view' && (
                <img
                  src="/assets/gallery/rooftop-pool.jpg"
                  alt="View from suite"
                  className="w-full h-full object-contain"
                />
              )}
              {activeMedia === 'floorplan' && (
                <div className="absolute inset-0 bg-white flex items-center justify-center p-8">
                  {suite.floor_plan_url ? (
                    <div
                      className="relative w-full h-full flex items-center justify-center cursor-pointer group/fp"
                      onClick={() => setShowFullscreen(true)}
                    >
                      <img
                        src={suite.floor_plan_url}
                        alt={`Suite ${suite.unit_number} floor plan`}
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-sm rounded-full opacity-80 group-hover/fp:opacity-100 transition-opacity">
                        <Expand className="w-4 h-4" />
                        <span>Click to enlarge</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                        <Image className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">Floorplan Coming Soon</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Thumbnails */}
            <div className="flex border-t border-slate-200 p-4 gap-3 bg-slate-50 flex-shrink-0">
              <button
                onClick={() => setActiveMedia('render')}
                className={cn(
                  'w-20 h-16 rounded-lg overflow-hidden flex-shrink-0',
                  activeMedia === 'render' ? 'ring-2 ring-amber-500' : 'opacity-60 hover:opacity-100'
                )}
              >
                <img src={suiteImage} alt="Interior" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setActiveMedia('view')}
                className={cn(
                  'w-20 h-16 rounded-lg overflow-hidden flex-shrink-0',
                  activeMedia === 'view' ? 'ring-2 ring-amber-500' : 'opacity-60 hover:opacity-100'
                )}
              >
                <img src="/assets/gallery/rooftop-pool.jpg" alt="View" className="w-full h-full object-cover" />
              </button>
              <button
                onClick={() => setActiveMedia('floorplan')}
                className={cn(
                  'w-20 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden',
                  activeMedia === 'floorplan' ? 'ring-2 ring-amber-500' : 'opacity-60 hover:opacity-100',
                  suite.floor_plan_url ? 'bg-white border border-slate-200' : 'bg-slate-200'
                )}
              >
                {suite.floor_plan_url ? (
                  <img src={suite.floor_plan_url} alt="Floorplan" className="w-full h-full object-contain p-1 bg-white" />
                ) : (
                  <Image className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Stat Chip Component
function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg">
      <span className="text-slate-400">{icon}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-base text-slate-900 font-semibold">{value}</span>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  title,
  features,
  expanded,
  onToggle,
}: {
  title: string
  features: { icon: React.ElementType; label: string }[]
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 xl:cursor-default"
      >
        <h4 className="text-sm text-slate-400 uppercase tracking-wide font-medium">{title}</h4>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 xl:hidden transition-transform', expanded && 'rotate-180')} />
      </button>
      <div className={cn('px-3 pb-3 space-y-2', !expanded && 'hidden xl:block')}>
        {features.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
              <item.icon className="w-3 h-3 text-amber-500" />
            </div>
            <span className="text-sm text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

