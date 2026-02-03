/**
 * Virtual Tour Page - Hidden (not in menu)
 *
 * Embeds the Kuula 360° tour of the apartments
 * Access via: /virtual-tour
 */

import { Link } from 'react-router-dom'
import { Home, ChevronRight, Maximize2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export default function VirtualTourPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreen = () => {
    const iframe = document.getElementById('kuula-tour') as HTMLIFrameElement
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <Link to="/" className="text-slate-500 hover:text-slate-900 flex items-center gap-1">
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
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Explore Units
            </Link>
          </div>
        </div>
      </header>

      {/* Tour Info */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            360° Virtual Tour
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Explore our apartments in immersive 360° view. Click and drag to look around,
            use the thumbnails to navigate between rooms. Works with VR headsets too.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />
              <span>Drag to rotate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4" />
              <span>Pinch to zoom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kuula Embed */}
      <div className="w-full" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
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
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
