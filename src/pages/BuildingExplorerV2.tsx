import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import { Menu, X, ChevronLeft, ChevronRight, Maximize2, Building2, Compass, Check, Clock, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR } from '@/config/building'
import { cn } from '@/lib/utils'

// Luxury Gallery Version - Horizontal scrolling, full-width heroes

const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

const getSuiteImage = (unitNumber: number): string => {
  if ([2, 7, 9, 11].includes(unitNumber)) {
    return '/assets/gallery/suite-type-07.jpg'
  }
  return '/assets/gallery/suite-type-08.jpg'
}

const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-green-500', bg: 'bg-green-500' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-gold-500', bg: 'bg-gold-500' },
  sold: { icon: Lock, label: 'Sold', color: 'text-slate-400', bg: 'bg-slate-400' },
}

export default function BuildingExplorerV2() {
  const [selectedFloor, setSelectedFloor] = useState<number>(23)
  const [featuredSuite, setFeaturedSuite] = useState<ExecutiveSuite | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: apartments = [], isLoading } = useQuery({
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

  // Set first available suite as featured when floor changes
  useEffect(() => {
    if (floorApartments.length > 0) {
      const firstAvailable = floorApartments.find(a => a.status === 'available') || floorApartments[0]
      setFeaturedSuite(firstAvailable)
    }
  }, [selectedFloor, apartments])

  const floors = Array.from({ length: MAX_FLOOR - MIN_FLOOR + 1 }, (_, i) => MAX_FLOOR - i)

  const scrollSuites = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const getFloorStats = (floor: number) => {
    const floorApts = apartments.filter((apt) => apt.floor === floor)
    return {
      total: floorApts.length,
      available: floorApts.filter((a) => a.status === 'available').length,
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Minimal Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png" alt="Mercan Group" className="h-12 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Home</Link>
            <Link to="/building-v2" className="text-sm text-slate-900 font-medium">Gallery</Link>
            <Link to="/building-v3" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Tower</Link>
            <Link to="/building" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">Classic</Link>
          </nav>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Featured Suite */}
        <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
          {featuredSuite && (
            <>
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={getSuiteImage(featuredSuite.unit_number)}
                  alt="Featured Suite"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              </div>

              {/* Hero Content */}
              <div className="relative h-full max-w-screen-2xl mx-auto px-6 flex items-center">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                    <span className="text-gold-400 text-sm font-medium uppercase tracking-wider">Featured Suite</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl text-white heading-display mb-4">
                    Suite {featuredSuite.floor}-{featuredSuite.unit_number}
                  </h1>
                  <p className="text-xl text-white/80 mb-2">{getSuiteType(featuredSuite.size_sqm)}</p>
                  <div className="flex items-center gap-6 text-white/60 mb-8">
                    <span className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      {featuredSuite.size_sqm} m²
                    </span>
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Floor {featuredSuite.floor}
                    </span>
                  </div>
                  <button className="btn-gold flex items-center gap-2 text-lg">
                    View Suite Details
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Floor Selector - Horizontal Pills */}
        <section className="bg-white border-b border-slate-200 sticky top-[73px] z-40">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Select Floor:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {floors.map((floor) => {
                  const stats = getFloorStats(floor)
                  const isSelected = selectedFloor === floor
                  return (
                    <button
                      key={floor}
                      onClick={() => setSelectedFloor(floor)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                        isSelected
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {floor}
                      <span className={cn('ml-1.5 text-xs', isSelected ? 'text-white/70' : 'text-slate-400')}>
                        ({stats.available})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Horizontal Scrolling Suite Cards */}
        <section className="py-12 bg-stone-50">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl heading-display text-slate-900">Floor {selectedFloor}</h2>
                <p className="text-slate-500 mt-1">{floorApartments.length} executive suites available</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => scrollSuites('left')}
                  className="p-3 rounded-full bg-white border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollSuites('right')}
                  className="p-3 rounded-full bg-white border border-slate-200 hover:border-gold-400 hover:bg-gold-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {floorApartments.map((suite) => {
                const config = statusConfig[suite.status]
                const StatusIcon = config.icon
                const isSelected = featuredSuite?.id === suite.id

                return (
                  <div
                    key={suite.id}
                    onClick={() => setFeaturedSuite(suite)}
                    className={cn(
                      'flex-shrink-0 w-[300px] bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 snap-start',
                      isSelected
                        ? 'ring-2 ring-gold-500 shadow-xl scale-[1.02]'
                        : 'shadow-md hover:shadow-xl hover:scale-[1.01]'
                    )}
                  >
                    {/* Suite Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getSuiteImage(suite.unit_number)}
                        alt={`Suite ${suite.floor}-${suite.unit_number}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm',
                          config.color
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 border-4 border-gold-500 rounded-t-2xl pointer-events-none" />
                      )}
                    </div>

                    {/* Suite Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            Suite {suite.floor}-{suite.unit_number}
                          </h3>
                          <p className="text-sm text-gold-600">{getSuiteType(suite.size_sqm)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-4 h-4" />
                          {suite.size_sqm} m²
                        </span>
                        <span className="flex items-center gap-1">
                          <Compass className="w-4 h-4" />
                          North
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">Starting from</p>
                        <p className="text-lg font-semibold text-slate-900">Contact for Pricing</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Building Overview Strip */}
        <section className="bg-primary py-16">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-gold-400 mb-2">{apartments.length}</div>
                <div className="text-white/70">Executive Suites</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gold-400 mb-2">9</div>
                <div className="text-white/70">Luxury Floors</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-gold-400 mb-2">60-90</div>
                <div className="text-white/70">Square Meters</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-screen-2xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">© 2024 Pullman Hotel & Casino Panama. All rights reserved.</p>
          <p className="text-gold-500 text-xs mt-2">Version 2: Luxury Gallery</p>
        </div>
      </footer>
    </div>
  )
}
