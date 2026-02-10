import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAP_IMAGE = '/assets/maps/panama-area-map.png'

interface LocationMapProps {
  className?: string
}

export default function LocationMap({ className }: LocationMapProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1.5)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) {
        setShowFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFullscreen])

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showFullscreen])

  return (
    <>
      {/* Map Preview Card */}
      <div
        className={cn(
          'relative group cursor-pointer rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300',
          className
        )}
        onClick={() => { setShowFullscreen(true); setZoomLevel(1.5) }}
      >
        <img
          src={MAP_IMAGE}
          alt="Panama City area map showing landmarks, airport, and driving distances"
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          loading="eager"
        />

        {/* Gradient overlay at bottom for button contrast */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Hover darkening */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Always-visible "Open Map" button at bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-2.5 bg-white shadow-lg rounded-xl border border-stone-200 group-hover:shadow-xl group-hover:scale-105 transition-all duration-200 pointer-events-none">
          <Maximize2 className="w-4 h-4 text-slate-700" />
          <span className="text-sm font-semibold text-slate-900">Tap to Zoom & Explore</span>
        </div>

        {/* Corner badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 rounded-lg shadow-sm flex items-center gap-1.5 pointer-events-none">
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-[11px] font-semibold text-white">YOU ARE HERE</span>
        </div>
      </div>

      {/* Fullscreen Zoomable Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white h-screen overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 flex-shrink-0 bg-white z-10">
            <div>
              <div className="text-base font-bold text-slate-900">Panama City Area Map</div>
              <div className="text-xs text-slate-500">Drag to pan &bull; Pinch or use buttons to zoom</div>
            </div>
            <button
              onClick={() => setShowFullscreen(false)}
              className="p-2.5 min-w-[44px] min-h-[44px] bg-slate-100 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center"
              aria-label="Close map"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Scrollable + zoomable map */}
          <div
            className="flex-1 min-h-0 overflow-auto overscroll-contain bg-slate-100"
            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <img
              src={MAP_IMAGE}
              alt="Panama City area map"
              className="max-w-none h-auto mx-auto transition-all duration-200"
              style={{ width: `${zoomLevel * 100}vw` }}
              draggable={false}
            />
          </div>

          {/* Bottom Zoom Toolbar - always visible */}
          <div className="flex-shrink-0 flex items-center justify-center gap-3 px-4 py-3 bg-white border-t border-slate-200 z-10">
            <button
              onClick={() => setZoomLevel(z => Math.max(z - 0.5, 0.5))}
              disabled={zoomLevel <= 0.5}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-slate-700" />
            </button>

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200 min-w-[70px] justify-center">
              <span className="text-sm font-semibold text-slate-700 tabular-nums">{Math.round(zoomLevel * 100)}%</span>
            </div>

            <button
              onClick={() => setZoomLevel(z => Math.min(z + 0.5, 4))}
              disabled={zoomLevel >= 4}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-slate-700" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            <button
              onClick={() => setZoomLevel(1)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Fit to screen
            </button>
          </div>
        </div>
      )}
    </>
  )
}
