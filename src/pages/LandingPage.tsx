import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Apartment } from '@/types/database'
import { projectConfig } from '@/config/project'
import { MapPin, Building2, TrendingUp, ChevronRight, Download, ArrowRight, Users, Calendar, Globe, ExternalLink, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
// Aceternity UI Components
import { BackgroundBeams, TextGenerateEffect, FlipWords, Spotlight, HoverBorderGradient, FocusCards } from '@/components/ui'

// Gallery images for FocusCards showcase
const galleryCards = [
  { title: 'Rooftop Infinity Pool', src: '/assets/gallery/rooftop-pool.jpg', subtitle: 'Panoramic views' },
  { title: 'Elegant Suites', src: '/assets/gallery/suite-type-07.jpg', subtitle: 'Luxury finishes' },
  { title: 'Grand Lobby', src: '/assets/gallery/lobby.jpg', subtitle: 'Premium entrance' },
]

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

  const { data: apartments = [] } = useQuery({
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
                Interactive Map
              </Link>
              <Link to="/apartments" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Apartments
              </Link>
              <Link to="/location" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                Location
              </Link>
              <Link to="/about" className="text-sm text-white/80 hover:text-white transition-colors font-medium py-2 focus:outline-none focus:text-white focus:underline underline-offset-4">
                About
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
                  Interactive Map
                </Link>
                <Link
                  to="/apartments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium focus:outline-none focus:bg-white/10"
                >
                  Apartments
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
                  About
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

      {/* Hero Section - Enhanced with Aceternity UI */}
      <section id="main-content" className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Parallax */}
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>

        {/* Animated Spotlight Effect */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#d4af37"
        />

        {/* Animated Background Beams */}
        <BackgroundBeams className="opacity-40" />

        {/* Content */}
        <div className="relative page-container z-10">
          <div className="max-w-2xl">
            {/* Location Tag with Animation */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/30 mb-6">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent text-xs font-medium tracking-wider uppercase">
                {projectConfig.location.neighborhood}, {projectConfig.location.city}
              </span>
            </div>

            {/* Animated Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              <TextGenerateEffect
                words={projectConfig.name}
                className="text-white"
                filter={false}
                duration={0.8}
              />
            </h1>

            {/* Animated Tagline with FlipWords */}
            <p className="text-xl md:text-2xl text-white/80 mb-8 flex items-center gap-2 flex-wrap">
              Experience
              <FlipWords
                words={['Luxury', 'Elegance', 'Comfort', 'Excellence']}
                className="text-accent font-semibold"
                duration={3000}
              />
              <span className="hidden sm:inline">in the heart of Panama</span>
            </p>

            {/* CTAs with HoverBorderGradient */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
              <Link to="/building">
                <HoverBorderGradient
                  containerClassName="rounded-xl"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white font-medium"
                >
                  Explore Availability
                  <ArrowRight className="w-4 h-4" />
                </HoverBorderGradient>
              </Link>
              <a
                href="/Floor_Plan_Santa_Maria.pdf"
                download="Santa-Maria-Residences-Brochure.pdf"
                className="inline-flex items-center gap-2 px-5 py-3 text-white/80 hover:text-white text-sm font-medium transition-colors group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Download Brochure
              </a>
            </div>

            {/* Trust Strip - Key Metrics with Glass Effect */}
            <div className="grid grid-cols-2 sm:inline-flex sm:items-center gap-3 sm:gap-4 px-4 py-3 sm:py-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.floors}</span>
                <span className="text-white/70 text-sm">Floors</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.available}</span>
                <span className="text-white/70 text-sm">Available</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.startingPrice}</span>
                <span className="text-white/70 text-sm">From</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" aria-hidden="true" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" aria-hidden="true" />
                <span className="text-white font-semibold">{stats.deliveryYear}</span>
                <span className="text-white/70 text-sm">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Cue with Animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
          <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Discover</span>
          <div className="w-px h-8 bg-gradient-to-b from-accent/60 to-transparent" />
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

      {/* Why Pullman - Stats & Image Grid */}
      <section className="py-16 bg-gradient-to-b from-stone-50/80 to-white overflow-hidden">
        <div className="page-container">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">The Pullman Advantage</h2>
          </div>

          {/* Stats + Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Big Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-5xl font-bold mb-1 relative z-10">{projectConfig.building.totalUnits}</p>
                <p className="text-white/70 text-sm relative z-10">Executive Suites</p>
                <p className="text-white/50 text-xs mt-2 relative z-10">Across {projectConfig.building.totalFloors} floors</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-accent/30 transition-colors group">
                <p className="text-5xl font-bold text-primary mb-1">{projectConfig.building.completionYear}</p>
                <p className="text-text-secondary text-sm">Delivery Year</p>
                <p className="text-text-muted text-xs mt-2">Ready for occupancy</p>
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-accent/30 transition-colors group">
                <p className="text-5xl font-bold text-accent mb-1">5★</p>
                <p className="text-text-secondary text-sm">Pullman Brand</p>
                <p className="text-text-muted text-xs mt-2">Part of Accor ALL</p>
              </div>
              <div className="bg-accent rounded-2xl p-6 text-primary-dark relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-5xl font-bold mb-1 relative z-10">24/7</p>
                <p className="text-primary-dark/80 text-sm relative z-10">Hotel Services</p>
                <p className="text-primary-dark/60 text-xs mt-2 relative z-10">Concierge & room service</p>
              </div>
            </div>

            {/* Right: Image + Features */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-48 rounded-2xl overflow-hidden">
                <img
                  src="/assets/gallery/rooftop-pool.jpg"
                  alt="Rooftop infinity pool"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-semibold">World-Class Amenities</p>
                  <p className="text-white/70 text-sm">Casino, rooftop pool, restaurants</p>
                </div>
              </div>
              {/* Feature Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-32 rounded-xl overflow-hidden group">
                  <img
                    src="/assets/gallery/lobby.jpg"
                    alt="Premium lobby"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-sm font-medium">Premium Location</p>
                    <p className="text-white/70 text-xs">Via España corridor</p>
                  </div>
                </div>
                <div className="relative h-32 rounded-xl overflow-hidden group">
                  <img
                    src="/assets/gallery/suite-type-07.jpg"
                    alt="Hotel management"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-white text-sm font-medium">Hotel Management</p>
                    <p className="text-white/70 text-xs">Rental income potential</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Showcase - FocusCards */}
      <section className="py-12 bg-white">
        <div className="page-container">
          <div className="text-center mb-8">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Gallery</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Experience the Lifestyle</h2>
          </div>
          <FocusCards cards={galleryCards} />
        </div>
      </section>

      {/* Smart Availability Overview */}
      <section className="py-12 bg-stone-50">
        <div className="page-container">
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Left: Availability Stats */}
              <div className="p-8 lg:border-r border-stone-100">
                <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-4">Live Availability</p>
                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-primary">{stats.available}</span>
                    <span className="text-text-secondary">units available</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-text-secondary">Available: {stats.available}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-text-secondary">Reserved: {stats.reserved}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.available / stats.totalUnits) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">{Math.round((stats.available / stats.totalUnits) * 100)}% still available</p>
                  </div>
                </div>
              </div>

              {/* Center: Quick Stats */}
              <div className="p-8 lg:border-r border-stone-100 bg-stone-50/50">
                <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-4">Suite Overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-text-primary">53-85</p>
                    <p className="text-xs text-text-muted">Square meters range</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">Floors</p>
                    <p className="text-xs text-text-muted">17-25</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">14</p>
                    <p className="text-xs text-text-muted">Units per floor</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">360°</p>
                    <p className="text-xs text-text-muted">City views</p>
                  </div>
                </div>
              </div>

              {/* Right: CTA */}
              <div className="p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary to-primary-dark">
                <div className="mb-6">
                  <p className="text-white/70 text-sm mb-2">Ready to explore?</p>
                  <p className="text-white text-xl font-semibold">Browse our interactive building explorer</p>
                </div>
                <Link to="/building">
                  <HoverBorderGradient
                    containerClassName="rounded-xl"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium"
                  >
                    Explore Units
                    <ArrowRight className="w-4 h-4" />
                  </HoverBorderGradient>
                </Link>
                <p className="text-white/50 text-xs mt-4">View floor plans, pricing & availability</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-bleed Lifestyle Break - Parallax Section */}
      <section className="relative h-[60vh] min-h-[450px] flex items-center overflow-hidden">
        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 -top-20 -bottom-20"
          style={{
            backgroundImage: 'url(/assets/hotel-entrance.png)',
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

        {/* Content */}
        <div className="relative page-container z-10">
          <div className="max-w-xl">
            <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-4 animate-fade-in">
              {stats.available} of {stats.totalUnits} Units Available
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Find Your Perfect Residence
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
              From executive suites to premium residences — explore floor plans, views, and availability in our interactive building explorer.
            </p>
            <Link to="/building">
              <HoverBorderGradient
                containerClassName="rounded-xl"
                className="flex items-center gap-3 px-10 py-5 bg-slate-950 text-white font-semibold text-lg"
              >
                Explore All Units
                <ArrowRight className="w-5 h-5" />
              </HoverBorderGradient>
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
                  title="Panama City Central location"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Journey Section - Timeline Approach */}
      <section id="investor" className="py-20 bg-gradient-to-b from-primary via-primary-dark to-slate-900 relative overflow-hidden scroll-mt-16">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />

        <div className="page-container relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">Your Path to Residency</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Investment Journey</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              A clear pathway from investment to permanent residency in one of the world's most strategic locations.
            </p>
          </div>

          {/* Timeline Journey - Horizontal on desktop, vertical on mobile */}
          <div className="relative">
            {/* Desktop Timeline Line */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-4">
              {/* Step 1: Invest */}
              <div className="relative group">
                {/* Step Number - Circle */}
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary-dark font-bold text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform z-10">
                    1
                  </div>
                </div>
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/30 transition-all h-full">
                  <h3 className="text-lg font-bold text-white mb-2">Invest</h3>
                  <p className="text-4xl font-bold text-accent mb-2">$280K</p>
                  <p className="text-sm text-white/60">Minimum property investment to qualify for the program</p>
                </div>
              </div>

              {/* Step 2: Apply */}
              <div className="relative group">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary-dark font-bold text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform z-10">
                    2
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/30 transition-all h-full">
                  <h3 className="text-lg font-bold text-white mb-2">Apply</h3>
                  <p className="text-4xl font-bold text-accent mb-2">30 Days</p>
                  <p className="text-sm text-white/60">Fast-track to permanent residency approval</p>
                </div>
              </div>

              {/* Step 3: Maintain */}
              <div className="relative group">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary-dark font-bold text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform z-10">
                    3
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/30 transition-all h-full">
                  <h3 className="text-lg font-bold text-white mb-2">Maintain</h3>
                  <p className="text-4xl font-bold text-accent mb-2">1 Visit</p>
                  <p className="text-sm text-white/60">Just one visit every 2 years to maintain status</p>
                </div>
              </div>

              {/* Step 4: Citizenship */}
              <div className="relative group">
                <div className="flex justify-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent text-primary-dark font-bold text-lg flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform z-10">
                    4
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-accent/30 transition-all h-full">
                  <h3 className="text-lg font-bold text-white mb-2">Citizenship</h3>
                  <p className="text-4xl font-bold text-accent mb-2">5 Years</p>
                  <p className="text-sm text-white/60">Pathway to full Panamanian citizenship</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Panama - Key Stats Row */}
          <div className="mt-16 pt-16 border-t border-white/10">
            <div className="flex items-center gap-4 mb-8">
              <h3 className="text-xl font-bold text-white">Why Panama?</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-accent/30 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2.77M</p>
                  <p className="text-xs text-white/50">Visitors in 2024 (+10.6%)</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-accent/30 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <TrendingUp className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">$4.99B</p>
                  <p className="text-xs text-white/50">Canal revenue FY2024</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-accent/30 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Globe className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">85+</p>
                  <p className="text-xs text-white/50">Direct flight destinations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mercan Partnership Banner */}
          <div className="mt-12 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-1 h-full bg-accent" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left: Partner Info */}
              <div className="lg:col-span-5">
                <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-2">Trusted Partner</p>
                <h3 className="text-2xl font-bold text-white mb-3">Globally Supported by Mercan</h3>
                <p className="text-white/60 text-sm mb-4">
                  Since 1989, Mercan has operated globally with expertise in investment and immigration services across 30+ countries.
                </p>
                <a
                  href="https://mercan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-accent text-sm font-medium hover:underline"
                >
                  Learn about Mercan
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Right: Stats */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">900+</p>
                  <p className="text-xs text-white/50 mt-1">Team worldwide</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">4,100+</p>
                  <p className="text-xs text-white/50 mt-1">Golden Visa investors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">$2B</p>
                  <p className="text-xs text-white/50 mt-1">Project development</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">35+</p>
                  <p className="text-xs text-white/50 mt-1">Years experience</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link to="/contact" className="inline-block">
              <HoverBorderGradient
                containerClassName="rounded-xl"
                className="flex items-center gap-2 px-8 py-3 bg-slate-950 text-white font-medium"
              >
                Schedule a Consultation
                <ArrowRight className="w-4 h-4" />
              </HoverBorderGradient>
            </Link>
            <p className="text-xs text-white/40 mt-6 max-w-xl mx-auto">
              Programs vary by country; eligibility and timelines depend on individual circumstances. This is not immigration advice.
            </p>
          </div>
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

