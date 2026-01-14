import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import BuildingImage from '@/components/BuildingImage'
import FloorPanel from '@/components/FloorPanel'
import { BuildingNavigatorSkeleton } from '@/components/Skeleton'
import { Menu, X, ChevronDown, Building2 } from 'lucide-react'
import { MIN_FLOOR, MAX_FLOOR } from '@/config/building'

export default function BuildingExplorer() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedApartment, setSelectedApartment] = useState<ExecutiveSuite | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMobileFloorPicker, setShowMobileFloorPicker] = useState(false)

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

  // Handle URL params for deep linking
  useEffect(() => {
    if (apartments.length === 0) return

    const floorParam = searchParams.get('floor')
    const unitParam = searchParams.get('unit')

    if (floorParam) {
      const floor = parseInt(floorParam)
      if (floor >= MIN_FLOOR && floor <= MAX_FLOOR) {
        setSelectedFloor(floor)

        // If unit ID is also provided, select that suite
        if (unitParam) {
          const apt = apartments.find((a) => a.id === unitParam)
          if (apt) {
            setSelectedApartment(apt)
          }
        }
      }
      // Clear params after processing
      setSearchParams({}, { replace: true })
    }
  }, [apartments, searchParams])

  const floorApartments = selectedFloor
    ? apartments.filter((apt) => apt.floor === selectedFloor)
    : []

  // Calculate total stats
  const totalStats = {
    total: apartments.length,
    available: apartments.filter((a) => a.status === 'available').length,
    reserved: apartments.filter((a) => a.status === 'reserved').length,
    sold: apartments.filter((a) => a.status === 'sold').length,
  }

  // Reset apartment selection when floor changes
  const handleFloorClick = (floor: number) => {
    setSelectedFloor(floor)
    setSelectedApartment(null)
  }

  // In detail view mode (apartment selected)
  const isDetailView = !!selectedApartment

  // Get floor stats for mobile picker
  const getFloorStats = (floor: number) => {
    const floorApts = apartments.filter((apt) => apt.floor === floor)
    return {
      total: floorApts.length,
      available: floorApts.filter((a) => a.status === 'available').length,
    }
  }

  // Generate floor array (descending from 25 to 17)
  const floors = Array.from({ length: MAX_FLOOR - MIN_FLOOR + 1 }, (_, i) => MAX_FLOOR - i)

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
              alt="Mercan Group"
              className="h-14 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              Home
            </Link>
            <Link to="/building" className="text-sm text-slate-900 font-medium">
              Explore
            </Link>
            <Link to="/location" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              Location
            </Link>
            <Link to="/about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              About
            </Link>
            <Link to="/contact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            <Link to="/" className="block py-2 text-sm text-slate-500 hover:text-slate-900">Home</Link>
            <Link to="/building" className="block py-2 text-sm text-slate-900 font-medium">Explore</Link>
            <Link to="/location" className="block py-2 text-sm text-slate-500 hover:text-slate-900">Location</Link>
            <Link to="/about" className="block py-2 text-sm text-slate-500 hover:text-slate-900">About</Link>
            <Link to="/contact" className="block py-2 text-sm text-slate-500 hover:text-slate-900">Contact</Link>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Mobile Floor Picker - Shows on small screens */}
        {!isDetailView && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4">
            <button
              onClick={() => setShowMobileFloorPicker(!showMobileFloorPicker)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">
                  {selectedFloor ? `Floor ${selectedFloor}` : 'Select a Floor'}
                </span>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showMobileFloorPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Mobile Floor Grid */}
            {showMobileFloorPicker && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-[40vh] overflow-y-auto p-1">
                {floors.map((floor) => {
                  const stats = getFloorStats(floor)
                  const isSelected = selectedFloor === floor
                  return (
                    <button
                      key={floor}
                      onClick={() => {
                        handleFloorClick(floor)
                        setShowMobileFloorPicker(false)
                      }}
                      className={`p-3 rounded-lg text-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-900'
                          : stats.available > 0
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="text-lg font-bold">{floor}</div>
                      <div className="text-[10px] opacity-75">{stats.available}/{stats.total}</div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {totalStats.available} available
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                {totalStats.reserved} reserved
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                {totalStats.sold} sold
              </span>
            </div>
          </div>
        )}

        {/* Left Panel - Building Navigator (hidden on mobile and in detail view) */}
        {!isDetailView && (
          <div className="hidden lg:flex w-[38%] border-r border-slate-200 bg-white flex-col">
            <div className="flex-1 p-4 overflow-hidden">
              {isLoading ? (
                <BuildingNavigatorSkeleton />
              ) : (
                <BuildingImage
                  apartments={apartments}
                  selectedFloor={selectedFloor}
                  onFloorClick={handleFloorClick}
                />
              )}
            </div>
          </div>
        )}

        {/* Right Panel - Units Selection / Detail View */}
        <div className={isDetailView ? 'flex-1 overflow-hidden' : 'flex-1 lg:w-[62%]'}>
          {isDetailView ? (
            <FloorPanel
              floor={selectedFloor}
              apartments={floorApartments}
              allApartments={apartments}
              selectedApartment={selectedApartment}
              onApartmentClick={setSelectedApartment}
              totalStats={totalStats}
            />
          ) : (
            <div className="h-full p-4 lg:p-5 overflow-auto bg-stone-50">
              <FloorPanel
                floor={selectedFloor}
                apartments={floorApartments}
                allApartments={apartments}
                selectedApartment={selectedApartment}
                onApartmentClick={setSelectedApartment}
                totalStats={totalStats}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
