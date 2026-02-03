/**
 * Virtual Tour Page - Showcase 360° tours by suite type
 *
 * Access via: /virtual-tour
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, ChevronRight, Maximize2, Move, ZoomIn, MousePointer2, Play, Bed, Maximize, Check } from 'lucide-react'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'

// Suite types with their 360° tour links
const SUITE_TOURS = [
  {
    id: 'suite-6',
    name: 'Suite Type A',
    suiteNumber: 6,
    size: '47.29 m²',
    description: 'Elegant studio suite with panoramic city views, featuring a modern kitchenette and luxurious bathroom.',
    features: ['King Bed', 'City View', 'Kitchenette', 'Walk-in Shower'],
    image: '/assets/suites/executive-suite-type-a-suite-3.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS3N?logo=-1&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
    available: true,
  },
  {
    id: 'suite-7',
    name: 'Suite Type B',
    suiteNumber: 7,
    size: '51.94 m²',
    description: 'Spacious corner suite with dual-aspect windows, offering stunning views of Panama Bay and the city skyline.',
    features: ['King Bed', 'Corner Unit', 'Bay View', 'Soaking Tub'],
    image: '/assets/suites/executive-suite-type-e-suite-7.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS28?logo=-1&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
    available: true,
  },
  {
    id: 'suite-8',
    name: 'Suite Type C',
    suiteNumber: 8,
    size: '56.78 m²',
    description: 'Premium suite with separate living area, ideal for extended stays with full kitchen amenities.',
    features: ['King Bed', 'Living Area', 'Full Kitchen', 'Ocean View'],
    image: '/assets/suites/executive-suite-type-e-suite-8.jpg',
    tourUrl: 'https://kuula.co/share/collection/7HS2n?logo=-1&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1',
    available: true,
  },
]

export default function VirtualTourPage() {
  const [selectedSuite, setSelectedSuite] = useState(SUITE_TOURS[0])
  const [isLoading, setIsLoading] = useState(true)

  const handleFullscreen = () => {
    const iframe = document.getElementById('kuula-tour') as HTMLIFrameElement
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen()
    }
  }

  const handleSuiteChange = (suite: typeof SUITE_TOURS[0]) => {
    if (suite.id !== selectedSuite.id) {
      setIsLoading(true)
      setSelectedSuite(suite)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <img
                src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                alt="Mercan Group"
                className="h-10 lg:h-12"
              />
            </Link>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm ml-3 pl-3 border-l border-slate-200">
              <Link to="/" className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-900 font-medium">360° Virtual Tours</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFullscreen}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
            <Link
              to="/building"
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
            >
              Explore Units
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar - Suite Selector */}
        <div className="lg:w-80 xl:w-96 bg-slate-800 border-b lg:border-b-0 lg:border-r border-slate-700 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
              360° Virtual Tours
            </h1>
            <p className="text-slate-400 text-sm mb-6">
              Explore our suite types in immersive 360°. Select a suite below to start the tour.
            </p>

            {/* Suite Cards */}
            <div className="space-y-3">
              {SUITE_TOURS.map((suite) => (
                <button
                  key={suite.id}
                  onClick={() => handleSuiteChange(suite)}
                  className={cn(
                    "w-full text-left rounded-xl overflow-hidden transition-all duration-200",
                    selectedSuite.id === suite.id
                      ? "ring-2 ring-amber-400 bg-slate-700"
                      : "bg-slate-700/50 hover:bg-slate-700"
                  )}
                >
                  <div className="flex gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={suite.image}
                        alt={suite.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedSuite.id === suite.id && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{suite.name}</h3>
                        {selectedSuite.id === suite.id && (
                          <span className="px-1.5 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-bold rounded">
                            PLAYING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Maximize className="w-3 h-3" />
                          {suite.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3 h-3" />
                          Suite #{suite.suiteNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {suite.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Navigation Tips
              </h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-amber-400" />
                  <span>Drag to look around</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-amber-400" />
                  <span>Scroll to zoom in/out</span>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer2 className="w-4 h-4 text-amber-400" />
                  <span>Click hotspots to move</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - 360° Viewer */}
        <div className="flex-1 flex flex-col bg-slate-900 min-h-[400px] lg:min-h-0">
          {/* Selected Suite Info Bar */}
          <div className="bg-slate-800/50 border-b border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {selectedSuite.name} — Suite #{selectedSuite.suiteNumber}
                </h2>
                <p className="text-sm text-slate-400">{selectedSuite.size}</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {selectedSuite.features.slice(0, 3).map((feature, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300"
                  >
                    <Check className="w-3 h-3 text-amber-400" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Kuula Embed */}
          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400">Loading 360° tour...</p>
                </div>
              </div>
            )}
            <iframe
              id="kuula-tour"
              key={selectedSuite.id}
              src={selectedSuite.tourUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              allow="xr-spatial-tracking; gyroscope; accelerometer"
              scrolling="no"
              title={`${selectedSuite.name} - 360° Virtual Tour`}
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
