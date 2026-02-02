import { useState } from 'react'
import { cn } from '@/lib/utils'

type MapView = 'neighborhood' | 'city'

interface LocationMapProps {
  className?: string
  defaultView?: MapView
  /** Show the toggle tabs (default true). Set false for compact usage */
  showToggle?: boolean
}

export default function LocationMap({ className, defaultView = 'neighborhood', showToggle = true }: LocationMapProps) {
  const [activeView, setActiveView] = useState<MapView>(defaultView)

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Toggle Tabs */}
      {showToggle && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-stone-200">
          <button
            onClick={() => setActiveView('neighborhood')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeView === 'neighborhood'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Neighborhood
          </button>
          <button
            onClick={() => setActiveView('city')}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeView === 'city'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Panama City
          </button>
        </div>
      )}

      {/* Map Images */}
      <img
        src="/assets/maps/neighborhood-map.png"
        alt="Neighborhood map showing nearby points of interest and walking distances"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          activeView === 'neighborhood' ? 'opacity-100' : 'opacity-0 absolute inset-0'
        )}
      />
      <img
        src="/assets/maps/panama-city-map.png"
        alt="Panama City map showing landmarks, airport, and driving distances"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          activeView === 'city' ? 'opacity-100' : 'opacity-0 absolute inset-0'
        )}
      />
    </div>
  )
}
