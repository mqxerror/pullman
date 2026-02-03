/**
 * Virtual Tour Page - Hidden (not in menu)
 *
 * Embeds the Kuula 360° tour of the apartments
 * Access via: /virtual-tour
 */

import { Link } from 'react-router-dom'
import { Home, ChevronRight, Maximize2, MousePointer2, Move, ZoomIn } from 'lucide-react'
import Footer from '@/components/Footer'

export default function VirtualTourPage() {
  const handleFullscreen = () => {
    const iframe = document.getElementById('kuula-tour') as HTMLIFrameElement
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
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
              <span className="text-slate-900 font-medium">Virtual Tour</span>
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

      {/* Tour Info Bar */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                360° Virtual Tour
              </h1>
              <p className="text-slate-400 text-sm">
                Explore our apartments in immersive 360° view. Navigate between rooms using thumbnails below.
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <Move className="w-4 h-4 text-amber-400" />
                <span>Drag to rotate</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <ZoomIn className="w-4 h-4 text-amber-400" />
                <span>Scroll to zoom</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                <MousePointer2 className="w-4 h-4 text-amber-400" />
                <span>Click hotspots</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kuula Embed - Flex grow to fill space */}
      <div className="flex-1 bg-slate-900">
        <iframe
          id="kuula-tour"
          src="https://kuula.co/share/collection/7HS3N?logo=-1&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="xr-spatial-tracking; gyroscope; accelerometer"
          scrolling="no"
          title="Pullman Hotel Panama - 360° Virtual Tour"
          className="w-full h-full min-h-[500px]"
          style={{ height: '100%' }}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
