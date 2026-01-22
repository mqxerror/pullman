import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ExecutiveSuite } from '@/types/database'
import { projectConfig } from '@/config/project'
import { getSuiteType, getSuiteImage } from '@/config/suiteData'
import {
  Menu, X, Check, Clock, Lock, Maximize2, ArrowRight, ArrowUpDown,
  SlidersHorizontal, Building2, Filter, Grid3X3, LayoutList,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
// Aceternity UI Components
import { BackgroundBeams, TextGenerateEffect, HoverBorderGradient, Spotlight } from '@/components/ui'

type SortOption = 'unit' | 'size_asc' | 'size_desc' | 'floor_asc' | 'floor_desc'
type StatusFilter = 'all' | 'available' | 'reserved' | 'sold'
type ViewMode = 'grid' | 'list'

const statusConfig = {
  available: { icon: Check, label: 'Available', color: 'text-emerald-600', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', border: 'border-emerald-200' },
  reserved: { icon: Clock, label: 'Reserved', color: 'text-amber-600', bg: 'bg-amber-500', bgLight: 'bg-amber-50', border: 'border-amber-200' },
  sold: { icon: Lock, label: 'Sold', color: 'text-slate-400', bg: 'bg-slate-400', bgLight: 'bg-slate-50', border: 'border-slate-200' },
}

const getDirectionLabel = (unitNumber: number): string => {
  // Map unit numbers to compass directions based on building orientation
  if (unitNumber <= 4) return 'N'
  if (unitNumber <= 7) return 'E'
  if (unitNumber <= 10) return 'S'
  return 'W'
}

export default function ApartmentsPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('unit')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all')
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // Show 12 items per page (4x3 grid)

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

  // Get unique floors for filter dropdown
  const floors = useMemo(() => {
    const uniqueFloors = [...new Set(apartments.map(a => a.floor))].sort((a, b) => b - a)
    return uniqueFloors
  }, [apartments])

  // Filter and sort apartments
  const filteredApartments = useMemo(() => {
    let result = [...apartments]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(apt => apt.status === statusFilter)
    }

    // Available only toggle
    if (availableOnly) {
      result = result.filter(apt => apt.status === 'available')
    }

    // Floor filter
    if (floorFilter !== 'all') {
      result = result.filter(apt => apt.floor === floorFilter)
    }

    // Size filter
    if (sizeFilter !== 'all') {
      result = result.filter(apt => {
        if (sizeFilter === 'small') return apt.size_sqm < 60
        if (sizeFilter === 'medium') return apt.size_sqm >= 60 && apt.size_sqm < 75
        if (sizeFilter === 'large') return apt.size_sqm >= 75
        return true
      })
    }

    // Sort
    switch (sortBy) {
      case 'size_asc':
        result.sort((a, b) => a.size_sqm - b.size_sqm)
        break
      case 'size_desc':
        result.sort((a, b) => b.size_sqm - a.size_sqm)
        break
      case 'floor_asc':
        result.sort((a, b) => a.floor - b.floor || a.unit_number - b.unit_number)
        break
      case 'floor_desc':
        result.sort((a, b) => b.floor - a.floor || a.unit_number - b.unit_number)
        break
      default:
        result.sort((a, b) => a.floor - b.floor || a.unit_number - b.unit_number)
    }

    return result
  }, [apartments, statusFilter, availableOnly, sortBy, floorFilter, sizeFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, availableOnly, floorFilter, sizeFilter, sortBy])

  // Pagination calculations
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage)
  const paginatedApartments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredApartments.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredApartments, currentPage, itemsPerPage])

  // Pagination helpers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    // Scroll to top of grid
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  // Stats - use config total for consistency
  const stats = {
    total: projectConfig.building.totalUnits, // Always show 126
    available: apartments.filter(a => a.status === 'available').length,
    reserved: apartments.filter(a => a.status === 'reserved').length,
    sold: apartments.filter(a => a.status === 'sold').length,
    filtered: filteredApartments.length,
  }

  const handleCardClick = (apt: ExecutiveSuite) => {
    navigate(`/suite/${apt.floor}/${apt.unit_number}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-stone-50 to-slate-100">
      {/* Navigation */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                alt="Mercan Group"
                className="h-12 lg:h-14 w-auto"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/building" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Interactive Map
              </Link>
              <Link to="/apartments" className="text-sm text-primary font-medium">
                Apartments
              </Link>
              <Link to="/location" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Location
              </Link>
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                About
              </Link>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 p-4 bg-white rounded-xl border border-slate-200 shadow-lg">
              <div className="flex flex-col gap-1">
                <Link to="/building" className="px-4 py-3 hover:bg-slate-100 rounded-lg transition-colors">Interactive Map</Link>
                <Link to="/apartments" className="px-4 py-3 bg-primary/10 text-primary rounded-lg font-medium">Apartments</Link>
                <Link to="/location" className="px-4 py-3 hover:bg-slate-100 rounded-lg transition-colors">Location</Link>
                <Link to="/about" className="px-4 py-3 hover:bg-slate-100 rounded-lg transition-colors">About</Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with Spotlight */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-slate-900">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(201, 162, 39, 0.15)" />
        <div className="page-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4">
              {stats.available} of {stats.total} Available
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <TextGenerateEffect words="Explore All Apartments" className="text-white" filter={false} duration={0.6} />
            </h1>
            <p className="text-white/70 text-lg">
              Browse our complete collection of {projectConfig.building.totalUnits} executive suites across {projectConfig.building.totalFloors} floors.
              Filter by size, floor, or availability to find your perfect residence.
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-white/70 text-sm">Available</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.available}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-white/70 text-sm">Reserved</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.reserved}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-white/70 text-sm">Sold</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.sold}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-sm">Floors</span>
              </div>
              <p className="text-3xl font-bold text-white">{projectConfig.building.floorRange.min}-{projectConfig.building.floorRange.max}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-[73px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="page-container py-4">
          {/* Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            {/* Status Filter Tabs - Scrollable on mobile */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap min-h-[40px]',
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                All <span className="ml-1 text-slate-400">{stats.total}</span>
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={cn(
                  'px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px]',
                  statusFilter === 'available'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Available</span><span className="sm:hidden">Avail</span> <span className="ml-1 text-slate-400">{stats.available}</span>
              </button>
              <button
                onClick={() => setStatusFilter('reserved')}
                className={cn(
                  'px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px]',
                  statusFilter === 'reserved'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reserved</span><span className="sm:hidden">Rsv</span> <span className="ml-1 text-slate-400">{stats.reserved}</span>
              </button>
              <button
                onClick={() => setStatusFilter('sold')}
                className={cn(
                  'px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap min-h-[40px]',
                  statusFilter === 'sold'
                    ? 'bg-white text-slate-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Lock className="w-3.5 h-3.5" />
                Sold <span className="ml-1 text-slate-400">{stats.sold}</span>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Sort Dropdown - Hidden on small mobile */}
              <div className="relative hidden sm:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3 md:px-4 py-2.5 pr-9 md:pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer min-h-[44px]"
                >
                  <option value="unit">Sort: Unit</option>
                  <option value="size_asc">Size: Small to Large</option>
                  <option value="size_desc">Size: Large to Small</option>
                  <option value="floor_asc">Floor: Low to High</option>
                  <option value="floor_desc">Floor: High to Low</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* More Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-3 md:px-4 py-2.5 rounded-lg border transition-all text-sm font-medium min-h-[44px]',
                  showFilters
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* View Toggle */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-all',
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4">
              {/* Floor Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Floor:</label>
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Floors</option>
                  {floors.map(floor => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500">Size:</label>
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value as 'all' | 'small' | 'medium' | 'large')}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Small (&lt;60 m²)</option>
                  <option value="medium">Medium (60-75 m²)</option>
                  <option value="large">Large (75+ m²)</option>
                </select>
              </div>

              {/* Available Only Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                </div>
                <span className="text-sm text-slate-600">Available only</span>
              </label>

              {/* Clear Filters */}
              {(statusFilter !== 'all' || floorFilter !== 'all' || sizeFilter !== 'all' || availableOnly) && (
                <button
                  onClick={() => {
                    setStatusFilter('all')
                    setFloorFilter('all')
                    setSizeFilter('all')
                    setAvailableOnly(false)
                  }}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, stats.filtered)}</span> of <span className="font-medium text-slate-900">{stats.filtered}</span> apartments
            </span>
            <span className="text-emerald-600 font-medium">
              {stats.available} available • Page {currentPage} of {totalPages || 1}
            </span>
          </div>
        </div>
      </section>

      {/* Apartments Grid */}
      <section className="py-8">
        <div className="page-container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-80" />
              ))}
            </div>
          ) : filteredApartments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No apartments found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters to see more results.</p>
              <button
                onClick={() => {
                  setStatusFilter('all')
                  setFloorFilter('all')
                  setSizeFilter('all')
                  setAvailableOnly(false)
                }}
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedApartments.map((apt) => {
                const config = statusConfig[apt.status]
                const StatusIcon = config.icon
                // Track hover state for potential animations
                void hoveredCard

                return (
                  <div
                    key={apt.id}
                    onClick={() => handleCardClick(apt)}
                    onMouseEnter={() => setHoveredCard(apt.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={cn(
                      'group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
                      'border-2 hover:shadow-xl hover:-translate-y-1',
                      apt.status === 'available' ? 'border-emerald-200 hover:border-emerald-400' :
                      apt.status === 'reserved' ? 'border-amber-200 hover:border-amber-400' :
                      'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getSuiteImage(apt.unit_number)}
                        alt={`Suite ${apt.floor}-${apt.unit_number}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Status Badge */}
                      <div className={cn(
                        'absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold',
                        config.bgLight, config.color
                      )}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>

                      {/* Suite Type */}
                      <div className="absolute bottom-4 left-4">
                        <span className="text-white/70 text-xs font-medium">{getSuiteType(apt.size_sqm)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Unit Number & Floor */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">
                            {apt.floor}-{apt.unit_number}
                          </h3>
                          <p className="text-sm text-slate-500">Floor {apt.floor}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-3 h-3 rounded-full', config.bg)} />
                          <span className="text-xs font-medium text-slate-500">{getDirectionLabel(apt.unit_number)}</span>
                        </div>
                      </div>

                      {/* Size & Price */}
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="w-4 h-4 text-slate-400" />
                          {apt.size_sqm} m²
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <p className="text-xs text-slate-400 uppercase tracking-wider">From</p>
                        <p className="text-2xl font-bold text-primary">Contact for Pricing</p>
                      </div>

                      {/* CTA Button */}
                      <button
                        className={cn(
                          'w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                          apt.status === 'available'
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : apt.status === 'reserved'
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        )}
                        disabled={apt.status === 'sold'}
                      >
                        {apt.status === 'sold' ? 'Sold' : 'View Details'}
                        {apt.status !== 'sold' && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {paginatedApartments.map((apt) => {
                const config = statusConfig[apt.status]
                const StatusIcon = config.icon

                return (
                  <div
                    key={apt.id}
                    onClick={() => handleCardClick(apt)}
                    className={cn(
                      'flex items-center gap-6 bg-white rounded-xl p-4 cursor-pointer transition-all',
                      'border-2 hover:shadow-lg',
                      apt.status === 'available' ? 'border-emerald-200 hover:border-emerald-400' :
                      apt.status === 'reserved' ? 'border-amber-200 hover:border-amber-400' :
                      'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {/* Image */}
                    <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={getSuiteImage(apt.unit_number)}
                        alt={`Suite ${apt.floor}-${apt.unit_number}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{apt.floor}-{apt.unit_number}</h3>
                        <span className="text-sm text-slate-500">{getSuiteType(apt.size_sqm)}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5" />
                          {apt.size_sqm} m²
                        </span>
                        <span>Floor {apt.floor}</span>
                        <span>{getDirectionLabel(apt.unit_number)}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase">From</p>
                      <p className="text-lg font-bold text-primary">Contact</p>
                    </div>

                    {/* Status */}
                    <div className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold',
                      config.bgLight, config.color
                    )}>
                      <StatusIcon className="w-4 h-4" />
                      {config.label}
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {/* Page Info */}
              <p className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
              </p>

              {/* Pagination Buttons */}
              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  aria-label="First page"
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === 1
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                  {getPageNumbers().map((page, idx) => (
                    page === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={cn(
                          'min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all',
                          currentPage === page
                            ? 'bg-primary text-white shadow-md'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        )}
                      >
                        {page}
                      </button>
                    )
                  ))}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === totalPages
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    currentPage === totalPages
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  aria-label="Last page"
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>

              {/* Items per page info */}
              <p className="text-xs text-slate-400">
                Showing {itemsPerPage} apartments per page
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-primary-dark to-slate-900 relative overflow-hidden">
        <BackgroundBeams className="opacity-20" />
        <div className="page-container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Explore Our Premium Suites
          </h2>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Discover the perfect suite that matches your lifestyle with our interactive building explorer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/building">
              <HoverBorderGradient
                containerClassName="rounded-xl"
                className="flex items-center gap-2 px-8 py-4 bg-slate-950 text-white font-medium"
              >
                Explore Interactive Map
                <ArrowRight className="w-4 h-4" />
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
