/**
 * Virtual Tour Page - Showcase suite types with 360° tours
 *
 * Scrollable page with each suite type as a section featuring:
 * - Hero image
 * - Suite details
 * - Embedded 360° tour
 *
 * Access via: /virtual-tour
 */

import { Link } from 'react-router-dom'
import { Check, Maximize2, Bed, Bath, Maximize, ChevronRight, Move, ArrowRight } from 'lucide-react'
import Footer from '@/components/Footer'
import MainNav from '@/components/MainNav'
import { cn } from '@/lib/utils'
import { BackgroundBeams } from '@/components/ui'

// Suite types with their 360° tour links
// Prices and sizes from suiteData.ts (Official Excel spreadsheet Jan 21, 2026)
const SUITE_TYPES = [
  {
    id: 'suite-1',
    name: 'Executive Suite Type A1',
    suiteNumber: 1,
    size: '53.35 m²',
    price: '$308,096',
    description: 'Compact executive suite with lockoff capability, facing south-west. Features a well-appointed kitchen, bedroom, and bathroom. Ideal entry point for investors seeking hotel-managed rental income.',
    features: ['King Size Bed', 'Lockoff Option', 'South-West Facing', 'Kitchenette', 'City Views', 'Compact Layout'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'No' },
    image: '/assets/suites/executive-suite-type-a-suite-3.jpg',
    tourUrl: 'https://kuula.co/share/collection/7Htk7?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
  },
  {
    id: 'suite-5',
    name: 'Executive Suite Type C',
    suiteNumber: 5,
    size: '56.88 m²',
    price: '$328,482',
    description: 'West-facing executive suite with generous living space and modern finishes. Features a full kitchen, comfortable bedroom, and luxurious bathroom. Excellent value with premium city views.',
    features: ['King Size Bed', 'West Facing', 'Living/Dining Area', 'Full Kitchen', 'City Views', 'Laundry'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'No' },
    image: '/assets/suites/executive-suite-type-c-suite-5.jpg',
    tourUrl: 'https://kuula.co/share/collection/7Htkf?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
  },
  {
    id: 'suite-6',
    name: 'Deluxe Suite Type D',
    suiteNumber: 6,
    size: '63.80 m²',
    price: '$368,445',
    description: 'Elegant deluxe suite facing west with panoramic city views. Features spacious living/dining area, modern kitchenette with laundry, and luxurious bathroom. Perfect for investors seeking premium returns.',
    features: ['King Size Bed', 'West Facing', 'Living/Dining Area', 'Kitchenette', 'Laundry', 'City Views'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'No' },
    image: '/assets/suites/executive-suite-type-a-suite-3.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS3N?logo=-1&info=0&fs=0&vr=1&sd=1&initload=0&thumbs=1&autopilot=0&iosfs=0',
  },
  {
    id: 'suite-7',
    name: 'Deluxe Suite Type E',
    suiteNumber: 7,
    size: '74.46 m²',
    price: '$430,007',
    description: 'Our largest suite type with lockoff capability. North-facing corner unit with dual-aspect windows offering stunning views of Panama Bay and the city skyline. Features expanded living area and premium finishes.',
    features: ['King Size Bed', 'Lockoff Option', 'Corner Unit', 'North Facing', 'Bay Views', 'Largest Layout'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'Yes' },
    image: '/assets/suites/executive-suite-type-e-suite-7.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS28?logo=-1&info=0&fs=0&vr=1&sd=1&initload=0&thumbs=1&autopilot=0&iosfs=0',
  },
  {
    id: 'suite-8',
    name: 'Deluxe Suite Type E',
    suiteNumber: 8,
    size: '65.55 m²',
    price: '$378,551',
    description: 'Premium north-east facing suite with lockoff capability. Features generous living/dining space, well-appointed bathroom, and breathtaking front views of the city. Ideal for flexible rental strategies.',
    features: ['King Size Bed', 'Lockoff Option', 'North-East Facing', 'Front Views', 'Living/Dining', 'Laundry'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'Yes' },
    image: '/assets/suites/executive-suite-type-e-suite-8.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS2n?logo=-1&info=0&fs=0&vr=1&sd=1&initload=0&thumbs=1&autopilot=0&iosfs=0',
  },
  {
    id: 'suite-9',
    name: 'Premium Suite Type B',
    suiteNumber: 9,
    size: '85.25 m²',
    price: '$492,319',
    description: 'Spacious premium suite facing north-east with expansive living area, hallway, bedroom, and full bathroom. One of the largest layouts in the building, perfect for those seeking generous space and comfort.',
    features: ['King Size Bed', 'North-East Facing', 'Spacious Living', 'Hallway', 'Premium Finishes', 'Largest Units'],
    specs: { bedrooms: 1, bathrooms: 1, balcony: 'No' },
    image: '/assets/suites/standard-hotel-room.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HtkR?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
  },
]

export default function VirtualTourPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/gallery/lobby.jpg"
            alt="Pullman Hotel Panama"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <BackgroundBeams className="opacity-30" />
        <div className="relative h-full flex items-end z-10">
          <div className="page-container pb-12">
            <p className="text-amber-400 text-sm font-medium tracking-wider uppercase mb-3">
              Immersive Experience
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              360° Virtual Tours
            </h1>
            <p className="text-white/70 max-w-xl text-lg">
              Explore our suite types in stunning 360° detail. Walk through each room and experience the space before you invest.
            </p>
            <div className="flex items-center gap-6 mt-6 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-amber-400" />
                <span>Drag to look around</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="bg-white border-b border-slate-200 sticky top-[72px] z-40">
        <div className="page-container py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
            <span className="text-sm text-slate-500 flex-shrink-0">Jump to:</span>
            {SUITE_TYPES.map((suite) => (
              <a
                key={suite.id}
                href={`#${suite.id}`}
                className="flex-shrink-0 px-4 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-800 rounded-full text-sm font-medium text-slate-700 transition-colors"
              >
                {suite.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Suite Sections */}
      {SUITE_TYPES.map((suite, index) => (
        <section
          key={suite.id}
          id={suite.id}
          className={cn(
            "py-16 lg:py-24 scroll-mt-32",
            index % 2 === 1 ? "bg-slate-50" : "bg-white"
          )}
        >
          <div className="page-container">
            {/* Suite Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
              <div>
                <p className="text-amber-600 text-sm font-semibold tracking-wider uppercase mb-2">
                  Suite #{suite.suiteNumber}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                  {suite.name}
                </h2>
                <p className="text-slate-600 max-w-2xl">
                  {suite.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Starting from</p>
                  <p className="text-2xl font-bold text-amber-600">{suite.price}</p>
                </div>
                <Link
                  to="/building"
                  className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors"
                >
                  View Units
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left: Image + Specs */}
              <div className="space-y-6">
                {/* Suite Image */}
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={suite.image}
                    alt={suite.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1.5">
                        <Maximize className="w-4 h-4" />
                        <span className="font-semibold">{suite.size}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bed className="w-4 h-4" />
                        <span>{suite.specs.bedrooms} Bed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4" />
                        <span>{suite.specs.bathrooms} Bath</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-slate-100 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                    Suite Features
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {suite.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: 360° Tour (2 columns wide) */}
              <div className="lg:col-span-2">
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
                  {/* 360 Label */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">360° Tour</span>
                  </div>

                  {/* Fullscreen Button */}
                  <button
                    onClick={() => {
                      const iframe = document.getElementById(`tour-${suite.id}`) as HTMLIFrameElement
                      if (iframe?.requestFullscreen) {
                        iframe.requestFullscreen()
                      }
                    }}
                    className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white rounded-lg text-slate-800 text-sm font-medium transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Fullscreen
                  </button>

                  {/* Kuula Embed */}
                  <div className="aspect-[16/10] lg:aspect-[16/9]">
                    <iframe
                      id={`tour-${suite.id}`}
                      src={suite.tourUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allowFullScreen
                      allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay"
                      title={`${suite.name} - 360° Virtual Tour`}
                      className="w-full h-full"
                      style={{ touchAction: 'none' }}
                    />
                  </div>
                </div>

                {/* Tour Instructions */}
                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-amber-500" />
                    <span>Drag to rotate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Invest?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Explore available units and find your perfect investment opportunity at Pullman Hotel & Casino Panama.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/building"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-amber-50 transition-colors"
            >
              Explore Available Units
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/apartments"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              View All Apartments
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
