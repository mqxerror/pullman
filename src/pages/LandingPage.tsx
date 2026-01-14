import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Apartment } from '@/types/database'
import { projectConfig } from '@/config/project'
import { MapPin, Gem, Building2, TrendingUp, ChevronRight, Download, ArrowRight, Check, Bed, Maximize2, Compass, Users, Calendar, Globe, Award, ExternalLink, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
import { FeaturedUnitsSkeleton } from '@/components/Skeleton'

const iconMap = {
  MapPin,
  Gem,
  Building2,
  TrendingUp,
  Award,
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [selectedBeds, setSelectedBeds] = useState<string>('any')
  const [selectedStatus, setSelectedStatus] = useState<string>('available')
  const [selectedBudget, setSelectedBudget] = useState<string>('any')
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Track scroll for sticky search bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('floor', { ascending: false })

      if (error) throw error
      return data as Apartment[]
    },
  })

  // Calculate stats
  const stats = {
    available: apartments.filter((a) => a.status === 'available').length,
    reserved: apartments.filter((a) => a.status === 'reserved').length,
    floors: projectConfig.building.totalFloors,
    totalUnits: projectConfig.building.totalUnits,
    startingPrice: projectConfig.pricing.startingFrom,
    deliveryYear: projectConfig.building.completionYear,
  }

  // Featured units (available, higher floors)
  const featuredUnits = apartments
    .filter((a) => a.status === 'available')
    .sort((a, b) => b.floor - a.floor)
    .slice(0, 4)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedBeds !== 'any') params.set('beds', selectedBeds)
    if (selectedStatus !== 'available') params.set('status', selectedStatus)
    if (selectedBudget !== 'any') params.set('budget', selectedBudget)
    const queryString = params.toString()
    navigate(`/building${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-lg">
              <img
                src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                alt="Mercan Group"
                className="h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <Link to="/building" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Explore
              </Link>
              <Link to="/location" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Location
              </Link>
              <Link to="/about" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Residences
              </Link>
              <a href="#investor" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Investor
              </a>
              <Link to="/contact" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Contact
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20" aria-label="Mobile navigation">
              <div className="flex flex-col gap-1">
                <Link
                  to="/building"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium focus:outline-none focus:bg-white/10"
                >
                  Explore Units
                </Link>
                <Link
                  to="/location"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium focus:outline-none focus:bg-white/10"
                >
                  Location
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium focus:outline-none focus:bg-white/10"
                >
                  Residences
                </Link>
                <a
                  href="#investor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium focus:outline-none focus:bg-white/10"
                >
                  Investor Program
                </a>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 mt-2 bg-accent text-white text-center rounded-lg font-medium hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  Contact Us
                </Link>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="main-content" className="relative h-[85vh] min-h-[600px] flex items-center">
        {/* Background with subtle parallax effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 scale-105"
            style={{ transform: `translateY(${isScrolled ? '5%' : '0'})`, transition: 'transform 0.5s ease-out' }}
          >
            <img
              src={projectConfig.media.heroImage}
              alt={projectConfig.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </div>

        {/* Content */}
        <div className="relative page-container">
          <div className="max-w-2xl">
            <p className="text-accent text-sm font-medium tracking-wider uppercase mb-4">
              {projectConfig.location.neighborhood}, {projectConfig.location.city}
            </p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
              {projectConfig.name}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {projectConfig.tagline}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 mb-10">
              <Link
                to="/building"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-xl transition-colors"
              >
                Explore Availability
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/Floor_Plan_Santa_Maria.pdf"
                download="Santa-Maria-Residences-Brochure.pdf"
                className="inline-flex items-center gap-2 px-5 py-3 text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Brochure
              </a>
            </div>

            {/* Trust Strip - Key Metrics */}
            <div className="grid grid-cols-2 sm:inline-flex sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/70" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.floors}</span>
                <span className="text-white/70 text-sm">Floors</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/70" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.available}</span>
                <span className="text-white/70 text-sm">Available</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white/70" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.startingPrice}</span>
                <span className="text-white/70 text-sm">From</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/70" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.deliveryYear}</span>
                <span className="text-white/70 text-sm">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Discover</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* Quick Search Bar */}
      <section className="relative -mt-6 sm:-mt-10 z-10" aria-label="Search filters">
        <div className="page-container">
          <div className="bg-surface rounded-xl shadow-lg border border-border p-4 sm:px-5 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="grid grid-cols-2 sm:flex gap-3 flex-1">
                <select
                  value={selectedBeds}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  aria-label="Filter by bedrooms"
                  className="px-3 py-2.5 sm:py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="any">All Bedrooms</option>
                  <option value="studio">Studio</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="penthouse">Penthouse</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  aria-label="Filter by status"
                  className="px-3 py-2.5 sm:py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="available">Available</option>
                  <option value="all">All Status</option>
                </select>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  aria-label="Filter by budget"
                  className="px-3 py-2.5 sm:py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent col-span-2 sm:col-span-1"
                >
                  <option value="any">Any Budget</option>
                  <option value="300">Under $300K</option>
                  <option value="500">Under $500K</option>
                  <option value="750">Under $750K</option>
                  <option value="1000">$1M+</option>
                </select>
              </div>
              <div className="hidden sm:block flex-1 text-right">
                <span className="text-sm text-text-muted">
                  <span className="font-semibold text-text-primary">{stats.available}</span> units available
                </span>
              </div>
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
              >
                View Units
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mini-Search Bar (appears on scroll) */}
      <div className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}>
        <div className="bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="page-container py-2.5">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg">
                <img
                  src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                  alt="Mercan Group"
                  className="h-8 w-auto"
                />
              </Link>
              <select
                value={selectedBeds}
                onChange={(e) => setSelectedBeds(e.target.value)}
                aria-label="Filter by bedrooms"
                className="hidden sm:block px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="any">Beds</option>
                <option value="studio">Studio</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
              </select>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                aria-label="Filter by budget"
                className="hidden sm:block px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="any">Budget</option>
                <option value="300">Under $300K</option>
                <option value="500">Under $500K</option>
                <option value="750">Under $750K</option>
              </select>
              <div className="flex-1 text-right">
                <span className="text-xs text-text-muted">
                  <span className="font-semibold text-accent">{stats.available}</span> available
                </span>
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 sm:py-1.5 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span className="hidden sm:inline">View Units</span>
                <span className="sm:hidden">View</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Pullman - Signature Highlights */}
      <section className="py-14 bg-gradient-to-b from-stone-50/80 to-white overflow-hidden">
        <div className="page-container">
          {/* Section Header */}
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">The Pullman Advantage</h2>
          </div>

          {/* Horizontal Flowing Highlights */}
          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
              {projectConfig.highlights.map((highlight, i) => {
                const Icon = iconMap[highlight.icon as keyof typeof iconMap]
                return (
                  <div
                    key={i}
                    className="group relative flex flex-col items-center text-center"
                  >
                    {/* Icon Circle with Glow */}
                    <div className="relative mb-5">
                      <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative w-20 h-20 rounded-full bg-white shadow-lg shadow-stone-200/50 flex items-center justify-center group-hover:shadow-accent/20 group-hover:scale-110 transition-all duration-300">
                        <Icon className="w-8 h-8 text-accent" />
                      </div>
                      {/* Step number */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-md">
                        {i + 1}
                      </div>
                    </div>

                    {/* Text Content */}
                    <h3 className="text-base font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
                      {highlight.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-[200px]">
                      {highlight.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Availability */}
      <section className="py-10 bg-stone-50">
        <div className="page-container">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-accent text-xs font-medium tracking-widest uppercase mb-1">Featured</p>
              <h2 className="text-lg font-semibold text-text-primary">Premium Residences</h2>
            </div>
            <Link
              to="/building"
              className="text-sm text-primary hover:text-primary-light font-medium flex items-center gap-1"
            >
              View all {stats.available} available
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <FeaturedUnitsSkeleton />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredUnits.map((apt, index) => (
                <FeaturedUnitCard key={apt.id} apartment={apt} rank={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Discover Divider - Scroll Cue */}
      <div className="py-4 bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-text-muted font-medium tracking-widest uppercase">Discover</span>
          <div className="w-px h-5 bg-gradient-to-b from-stone-300 to-transparent" />
        </div>
      </div>

      {/* Full-bleed Lifestyle Break */}
      <section className="relative h-[45vh] min-h-[360px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/gallery/view-rooftop.jpg"
            alt="Rooftop lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        </div>
        {/* Content */}
        <div className="relative page-container">
          <div className="max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
              Designed for elevated everyday living.
            </h2>
            <p className="text-base text-white/70 mb-6">
              Where thoughtful architecture meets modern sophistication.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Explore Interiors
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-gradient-to-b from-stone-50 to-white">
        <div className="page-container">
          {/* Section Header */}
          <div className="text-center mb-10">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Prime Location</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Where Convenience Meets Lifestyle</h2>
          </div>

          {/* Key Location Facts Row - Cards with Glow */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            <div className="group bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">{projectConfig.location.neighborhood}</p>
                  <p className="text-sm text-text-secondary">{projectConfig.location.city}</p>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">5 min</p>
                  <p className="text-sm text-text-secondary">to Banking District</p>
                </div>
              </div>
            </div>
            <div className="group bg-white rounded-2xl p-5 shadow-sm border border-stone-100 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6 text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">85+</p>
                  <p className="text-sm text-text-secondary">Flight Destinations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Location Info */}
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-semibold text-text-primary mb-3">
                  {projectConfig.location.neighborhood}, {projectConfig.location.city}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  The perfect balance of urban convenience and residential tranquility. Walking distance to premier shopping, dining, and entertainment.
                </p>
              </div>

              {/* Nearby Anchor Chips */}
              <div className="flex flex-wrap gap-2">
                {['Business District', 'Shopping', 'Dining', 'Hospitals', 'Schools', 'Parks'].map((anchor, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs text-text-secondary font-medium"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {anchor}
                  </span>
                ))}
              </div>

              {/* Open in Maps link */}
              <a
                href={`https://maps.google.com/?q=${projectConfig.location.coordinates.lat},${projectConfig.location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-light font-medium"
              >
                <MapPin className="w-4 h-4" />
                Open in Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Right: Interactive Google Map */}
            <div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-stone-200 shadow-md">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d${projectConfig.location.coordinates.lng}!3d${projectConfig.location.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMjkuNSJOIDc5wrAzMCcxMi4yIlc!5e0!3m2!1sen!2sus!4v1702000000000!5m2!1sen!2sus`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Pullman Hotel & Casino location"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Separator - Timeline Notch */}
      <div id="investor" className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 scroll-mt-16">
        <div className="page-container pt-10 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Investment Pathway</p>
          </div>
        </div>
      </div>

      {/* Investor / Program Section */}
      <section className="pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-700/20 rounded-full blur-3xl" />

        <div className="page-container relative z-10">
          {/* Why Panama Block */}
          <div className="mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Panama
            </h2>
            <p className="text-base text-slate-300 mb-8 leading-relaxed max-w-2xl">
              A strategic hub connecting North and South America, Panama offers stability, growth, and global connectivity for investors seeking long-term value.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group">
                <p className="text-3xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">2.77M</p>
                <p className="text-sm text-slate-400">Visitors in 2024 (+10.6%)</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group">
                <p className="text-3xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">$4.99B</p>
                <p className="text-sm text-slate-400">Canal revenue FY2024</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group">
                <p className="text-3xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">85+</p>
                <p className="text-sm text-slate-400">Flight destinations</p>
              </div>
            </div>
          </div>

          {/* Program Snapshot */}
          <div className="mb-14 pb-14 border-b border-slate-700/50">
            {/* Section header with decorative lines */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-emerald-500/50" />
              <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
                Qualified Investor Program
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-emerald-500/30 to-emerald-500/50" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Program Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-400/50 transition-colors">
                <p className="text-3xl font-bold text-emerald-400 mb-2">$280K</p>
                <p className="text-sm text-slate-300">Min. Investment</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all">
                <p className="text-3xl font-bold text-white mb-2">30 days</p>
                <p className="text-sm text-slate-400">Permanent residency</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all">
                <p className="text-3xl font-bold text-white mb-2">1 visit</p>
                <p className="text-sm text-slate-400">Every 2 years</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 hover:bg-slate-800/70 transition-all">
                <p className="text-3xl font-bold text-white mb-2">5 years</p>
                <p className="text-sm text-slate-400">to Citizenship</p>
              </div>
            </div>
          </div>

          {/* Mercan Credibility */}
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-800/60 to-slate-800/30 p-8 border border-slate-700/50 overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              {/* Left: Content */}
              <div>
                <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-3">Partner</p>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Globally supported by Mercan
                </h3>
                <p className="text-base text-slate-300 mb-6 leading-relaxed">
                  Since 1989, Mercan has operated globally with expertise in investment and immigration services across 30+ countries.
                </p>
                <a
                  href="https://mercan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-sm text-emerald-400 font-medium transition-colors"
                >
                  Learn more about Mercan
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Right: Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 hover:bg-slate-800/70 transition-all border border-slate-700/50 hover:border-emerald-500/30 rounded-xl p-5 group">
                  <Users className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold text-white">900+</p>
                  <p className="text-xs text-slate-400 mt-1">Team worldwide</p>
                </div>
                <div className="bg-slate-800/50 hover:bg-slate-800/70 transition-all border border-slate-700/50 hover:border-emerald-500/30 rounded-xl p-5 group">
                  <Award className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold text-white">4,100+</p>
                  <p className="text-xs text-slate-400 mt-1">Golden Visa investors</p>
                </div>
                <div className="bg-slate-800/50 hover:bg-slate-800/70 transition-all border border-slate-700/50 hover:border-emerald-500/30 rounded-xl p-5 group">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold text-white">$2B</p>
                  <p className="text-xs text-slate-400 mt-1">Project development</p>
                </div>
                <div className="bg-slate-800/50 hover:bg-slate-800/70 transition-all border border-slate-700/50 hover:border-emerald-500/30 rounded-xl p-5 group">
                  <Globe className="w-6 h-6 text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
                  <p className="text-2xl font-bold text-white">35+</p>
                  <p className="text-xs text-slate-400 mt-1">Years experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* Investor CTA */}
          <div className="mt-12 text-center">
            <p className="text-slate-300 mb-4">Interested in the Qualified Investor Program?</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              Schedule a Consultation
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 mt-8 max-w-2xl text-center mx-auto">
            Programs vary by country; eligibility and timelines depend on individual circumstances. This is not immigration advice.
          </p>
        </div>
      </section>

      {/* CTA Band */}
      <section className="bg-primary">
        <div className="page-container py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">Ready to find your new home?</h2>
              <p className="text-sm text-white/80 mt-1">Speak with our sales team today</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary text-sm font-medium rounded-lg hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Featured Unit Card - Enhanced with visual header
function FeaturedUnitCard({ apartment, rank }: { apartment: Apartment; rank: number }) {
  const getUnitType = (sizeSqm: number): string => {
    if (sizeSqm >= 150) return 'Penthouse'
    if (sizeSqm >= 120) return '3 Bed'
    if (sizeSqm >= 90) return '2 Bed'
    if (sizeSqm >= 75) return '1 Bed'
    return 'Studio'
  }

  const getBeds = (sizeSqm: number): number => {
    if (sizeSqm >= 150) return 4
    if (sizeSqm >= 120) return 3
    if (sizeSqm >= 90) return 2
    if (sizeSqm >= 75) return 1
    return 0
  }

  const getPrice = (floor: number, sizeSqm: number): string => {
    const price = (3500 + (floor - 7) * 50) * sizeSqm
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    return `$${Math.round(price / 1000)}K`
  }

  const getViewDirection = (unitNumber: number): string => {
    const directions: Record<number, string> = {
      1: 'North', 2: 'North', 3: 'North', 4: 'NE', 5: 'East', 6: 'SE',
      7: 'South', 8: 'South', 9: 'South', 10: 'South', 11: 'SW', 12: 'West',
      13: 'NW', 14: 'North',
    }
    return directions[unitNumber] || 'City'
  }

  const getFeatureLabel = (rank: number, floor: number, sizeSqm: number): string => {
    if (sizeSqm >= 150) return 'Penthouse'
    if (rank === 0) return 'Highest floor'
    if (floor >= 35) return 'Premium views'
    if (sizeSqm >= 120) return 'Spacious'
    return 'Best value'
  }

  // Get gradient based on unit type - using brand colors
  const getHeaderStyle = (sizeSqm: number): string => {
    if (sizeSqm >= 150) return 'from-primary via-primary-light to-accent' // Penthouse - premium
    if (sizeSqm >= 120) return 'from-primary to-primary-light' // 3 Bed - elegant
    if (sizeSqm >= 90) return 'from-accent via-accent-light to-emerald-400' // 2 Bed - fresh
    return 'from-slate-600 via-slate-500 to-slate-400' // 1 Bed/Studio - neutral
  }

  const beds = getBeds(apartment.size_sqm)
  const unitType = getUnitType(apartment.size_sqm)
  const viewDir = getViewDirection(apartment.unit_number)
  const featureLabel = getFeatureLabel(rank, apartment.floor, apartment.size_sqm)

  return (
    <Link
      to={`/building?floor=${apartment.floor}&unit=${apartment.id}`}
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Gradient Header with Icon */}
      <div className={`relative h-24 bg-gradient-to-br ${getHeaderStyle(apartment.size_sqm)} p-4`}>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`pattern-${apartment.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100" height="100" fill={`url(#pattern-${apartment.id})`} />
          </svg>
        </div>

        {/* Feature Label */}
        <span className="relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[11px] text-white font-medium uppercase tracking-wide">
          {featureLabel}
        </span>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white text-emerald-600 text-[11px] font-semibold shadow-sm">
            <Check className="w-3 h-3" />
            Available
          </span>
        </div>

        {/* Large Floor Number */}
        <div className="absolute bottom-3 right-4 text-white/30 font-bold text-4xl leading-none">
          {apartment.floor}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Unit ID + Type */}
        <div className="mb-3">
          <span className="text-lg font-bold text-text-primary">
            Unit {apartment.floor}-{apartment.unit_number}
          </span>
          <p className="text-sm text-text-muted">{unitType}</p>
        </div>

        {/* Micro-details row */}
        <div className="flex items-center gap-4 text-sm text-text-secondary mb-4 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-text-muted" />
            <span>{beds === 0 ? 'Studio' : beds}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-text-muted" />
            <span>{apartment.size_sqm} m²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-text-muted" />
            <span>{viewDir}</span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-text-muted">From</span>
            <p className="text-lg text-text-primary font-bold">{getPrice(apartment.floor, apartment.size_sqm)}</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
            View
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}
