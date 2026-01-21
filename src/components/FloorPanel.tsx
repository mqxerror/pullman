import { useState } from 'react'
import type { ExecutiveSuite } from '@/types/database'
import SuiteCard from './building/SuiteCard'
import SuiteDetail from './building/SuiteDetail'
import { Check, Clock, Lock, Building2, Home, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloorPanelProps {
  floor: number | null
  apartments: ExecutiveSuite[]
  allApartments?: ExecutiveSuite[]
  selectedApartment: ExecutiveSuite | null
  onApartmentClick: (apt: ExecutiveSuite | null) => void
  totalStats?: { available: number; reserved: number; sold: number; total: number }
}

type StatusFilter = 'all' | 'available' | 'reserved' | 'sold'
type SortOption = 'unit' | 'price' | 'size'

export default function FloorPanel({
  floor,
  apartments,
  allApartments = [],
  selectedApartment,
  onApartmentClick,
  totalStats,
}: FloorPanelProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('unit')
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false)

  // Empty state
  if (!floor) {
    return (
      <div className="h-full flex flex-col">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-xs text-slate-400 mb-2">
            Projects / Panama City Central / Executive Suites
          </div>
          <h2 className="text-2xl text-slate-900 font-semibold">Suite Selection</h2>

          {/* Summary chips */}
          {totalStats && (
            <div className="flex items-center gap-2 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-600 font-medium">9 Floors (17-25)</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-emerald-200 bg-emerald-50">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-medium">{totalStats.available} Available</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-amber-200 bg-amber-50">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 font-medium">{totalStats.reserved} Reserved</span>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center">
              <Home className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg text-slate-900 font-semibold mb-2">Select a Floor</h3>
            <p className="text-sm text-slate-500">
              Click on the building or use the elevator panel to explore available executive suites.
            </p>
            <p className="text-xs text-slate-400 mt-3">
              Tip: Use <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[10px]">↓</kbd> keys to navigate
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Detail view
  if (selectedApartment) {
    return (
      <SuiteDetail
        suite={selectedApartment}
        onBack={() => onApartmentClick(null)}
        allSuites={allApartments}
      />
    )
  }

  // Calculate stats
  const stats = {
    total: apartments.length,
    available: apartments.filter((a) => a.status === 'available').length,
    reserved: apartments.filter((a) => a.status === 'reserved').length,
    sold: apartments.filter((a) => a.status === 'sold').length,
  }

  // Filter apartments
  let filteredApartments = statusFilter === 'all'
    ? apartments
    : apartments.filter((a) => a.status === statusFilter)

  if (showOnlyAvailable) {
    filteredApartments = filteredApartments.filter((a) => a.status === 'available')
  }

  // Sort apartments
  filteredApartments = [...filteredApartments].sort((a, b) => {
    if (sortBy === 'unit') return a.unit_number - b.unit_number
    if (sortBy === 'size') return b.size_sqm - a.size_sqm
    if (sortBy === 'price') {
      const priceA = (4000 + (a.floor - 17) * 100) * a.size_sqm
      const priceB = (4000 + (b.floor - 17) * 100) * b.size_sqm
      return priceA - priceB
    }
    return 0
  })

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="mb-4">
        <div className="text-xs text-slate-400 mb-1">
          Panama City Central / Floor {floor}
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl text-slate-900 font-semibold">Floor {floor}</h2>
          <span className="text-xs text-slate-400">
            {stats.available} of {stats.total} available
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left: Segmented Control */}
        <div className="segmented-control">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn('segment-btn', statusFilter === 'all' && 'active')}
          >
            <span>All</span>
            <span className="count">{stats.total}</span>
          </button>
          <button
            onClick={() => setStatusFilter('available')}
            className={cn('segment-btn', statusFilter === 'available' && 'active')}
          >
            <Check className={cn('w-3 h-3', statusFilter === 'available' ? 'text-white' : 'text-emerald-500')} />
            <span>Available</span>
            <span className="count">{stats.available}</span>
          </button>
          <button
            onClick={() => setStatusFilter('reserved')}
            className={cn('segment-btn', statusFilter === 'reserved' && 'active')}
          >
            <Clock className={cn('w-3 h-3', statusFilter === 'reserved' ? 'text-white' : 'text-amber-500')} />
            <span>Reserved</span>
            <span className="count">{stats.reserved}</span>
          </button>
          <button
            onClick={() => setStatusFilter('sold')}
            className={cn('segment-btn', statusFilter === 'sold' && 'active')}
          >
            <Lock className={cn('w-3 h-3', statusFilter === 'sold' ? 'text-white' : 'text-slate-400')} />
            <span>Sold</span>
            <span className="count">{stats.sold}</span>
          </button>
        </div>

        {/* Right: Sort + Toggle */}
        <div className="flex items-center gap-4">
          {/* Sort control */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-transparent text-slate-600 font-medium cursor-pointer focus:outline-none"
            >
              <option value="unit">Unit</option>
              <option value="price">Price</option>
              <option value="size">Size</option>
            </select>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
            className="flex items-center gap-2"
          >
            <div className={cn('toggle-switch', showOnlyAvailable && 'active')} />
            <span className="text-xs text-slate-500">Available only</span>
          </button>
        </div>
      </div>

      {/* Units Grid */}
      {filteredApartments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-slate-400">No {statusFilter !== 'all' ? statusFilter : ''} suites found</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredApartments.map((suite) => (
              <SuiteCard
                key={suite.id}
                suite={suite}
                onClick={() => onApartmentClick(suite)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
