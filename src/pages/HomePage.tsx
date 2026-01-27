import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Apartment } from '@/types/database'
import Header from '@/components/Header'
import BuildingImage from '@/components/BuildingImage'
import FloorPanel from '@/components/FloorPanel'

export default function HomePage() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null)
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ['pullman_suites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .order('floor', { ascending: true })
        .order('unit_number', { ascending: true })

      if (error) throw error
      return data as Apartment[]
    },
  })

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Building Navigator (hidden in detail view) */}
        {!isDetailView && (
          <div className="w-[38%] border-r border-border bg-surface flex flex-col">
            <div className="flex-1 p-4 overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm text-text-muted">Loading...</span>
                  </div>
                </div>
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
        <div className={isDetailView ? 'flex-1 overflow-hidden' : 'w-[62%]'}>
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
            <div className="h-full p-5 overflow-hidden">
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
