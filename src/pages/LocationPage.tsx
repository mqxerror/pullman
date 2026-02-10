import { Link } from 'react-router-dom'
import { projectConfig } from '@/config/project'
import LocationMap from '@/components/LocationMap'
import MainNav from '@/components/MainNav'
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Plane,
  ShoppingBag,
  GraduationCap,
  Stethoscope,
  Building2,
  Utensils,
  TreePine,
  ArrowRight,
  ExternalLink,
  Train,
  Coffee,
  Waves
} from 'lucide-react'
import Footer from '@/components/Footer'
// Aceternity UI Components - These will be used in future updates
// import { TextGenerateEffect, BackgroundBeams } from '@/components/ui'

const nearbyLocations = [
  {
    category: 'Shopping',
    icon: ShoppingBag,
    color: 'emerald',
    places: [
      { name: 'Multiplaza Pacific Mall', distance: '5 min', type: 'Premium shopping center' },
      { name: 'Albrook Mall', distance: '12 min', type: 'Largest mall in Central America' },
      { name: 'Soho Mall', distance: '8 min', type: 'Luxury boutiques' },
    ]
  },
  {
    category: 'Education',
    icon: GraduationCap,
    color: 'blue',
    places: [
      { name: 'Balboa Academy', distance: '7 min', type: 'International school' },
      { name: 'King\'s College', distance: '10 min', type: 'British curriculum' },
      { name: 'USMA University', distance: '8 min', type: 'Higher education' },
    ]
  },
  {
    category: 'Healthcare',
    icon: Stethoscope,
    color: 'rose',
    places: [
      { name: 'Hospital Punta Pacífica', distance: '6 min', type: 'Johns Hopkins affiliated' },
      { name: 'Hospital Nacional', distance: '10 min', type: 'Full-service hospital' },
      { name: 'Centro Médico Paitilla', distance: '8 min', type: 'Medical center' },
    ]
  },
  {
    category: 'Dining & Nightlife',
    icon: Utensils,
    color: 'amber',
    places: [
      { name: 'Casco Antiguo', distance: '15 min', type: 'Historic district dining' },
      { name: 'Costa del Este', distance: '12 min', type: 'Upscale restaurants' },
      { name: 'Calle Uruguay', distance: '5 min', type: 'Vibrant nightlife & dining' },
    ]
  },
  {
    category: 'Parks & Recreation',
    icon: TreePine,
    color: 'green',
    places: [
      { name: 'Parque Omar', distance: '3 min', type: 'Urban park, jogging trails' },
      { name: 'Cinta Costera', distance: '8 min', type: 'Oceanfront promenade' },
      { name: 'Panama Canal', distance: '20 min', type: 'Miraflores Locks visitor center' },
    ]
  },
  {
    category: 'Business District',
    icon: Building2,
    color: 'slate',
    places: [
      { name: 'Banking District', distance: '5 min', type: 'Financial hub' },
      { name: 'World Trade Center', distance: '8 min', type: 'Business center' },
      { name: 'Obarrio', distance: '6 min', type: 'Commercial district' },
    ]
  },
]

const transportInfo = [
  {
    icon: Plane,
    title: 'Tocumen International Airport',
    distance: '25 km',
    time: '25-35 min',
    description: 'Panama\'s main international hub with 85+ destinations worldwide',
    image: '/assets/gallery/airport.jpg'
  },
  {
    icon: Car,
    title: 'Corredor Sur Highway',
    distance: '2 km',
    time: '3 min',
    description: 'Express toll road connecting to airport and Costa del Este',
    image: '/assets/gallery/highway.jpg'
  },
  {
    icon: Train,
    title: 'Metro Line 1',
    distance: '1.5 km',
    time: '5 min walk',
    description: 'Via España station - fast access across the city',
    image: '/assets/gallery/metro.jpg'
  },
]

const lifestyleFeatures = [
  { icon: Coffee, label: 'Cafés', count: '50+' },
  { icon: Utensils, label: 'Restaurants', count: '200+' },
  { icon: ShoppingBag, label: 'Shops', count: '100+' },
  { icon: Waves, label: 'Beaches', count: '15 min' },
]

export default function LocationPage() {
  const { location } = projectConfig

  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero + Map Section — side by side on desktop */}
      <section id="main-content" className="py-10 md:py-14 bg-gradient-to-b from-stone-50 to-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Location Info */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg shadow-primary/30">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <p className="text-accent text-xs font-semibold tracking-widest uppercase">
                  Prime Location
                </p>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 leading-tight">
                {location.neighborhood}, {location.city}
              </h1>
              <p className="text-text-secondary mb-1">
                {location.address}
              </p>
              <p className="text-text-muted text-sm mb-6">
                {location.city}, {location.country}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-2 mb-6">
                {lifestyleFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-stone-200 shadow-sm"
                  >
                    <feature.icon className="w-4 h-4 text-accent" />
                    <span className="text-text-primary font-semibold text-sm">{feature.count}</span>
                    <span className="text-text-muted text-sm">{feature.label}</span>
                  </div>
                ))}
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${location.coordinates.lat},${location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-light text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            </div>

            {/* Right: Interactive Map Preview */}
            <div>
              <LocationMap className="aspect-[4/3]" />
              <p className="text-center text-xs text-text-muted mt-2">
                Tap the map to open a zoomable full-screen view
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transportation Section - Premium Cards */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-stone-50 to-white overflow-hidden">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
              Connectivity
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Easy Access to Everywhere
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Strategically located with excellent connectivity to major transportation hubs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transportInfo.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm"
              >
                <div className="mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-accent" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                  {item.description}
                </p>

                {/* Distance & Time Pills */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-medium text-text-secondary">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    {item.distance}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-medium text-text-secondary">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Image Break */}
      <section className="relative h-[40vh] min-h-[280px] md:min-h-[320px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/gallery/panama-skyline.jpg"
            alt="Panama City skyline"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=1920&q=80'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/50" />
        </div>

        <div className="relative page-container">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              Live in the Heart of Panama City
            </h2>
            <p className="text-lg text-white/80 mb-6">
              Where modern convenience meets vibrant culture
            </p>

            {/* Lifestyle Stats */}
            <div className="flex flex-wrap gap-4">
              {lifestyleFeatures.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                >
                  <feature.icon className="w-5 h-5 text-white/80" />
                  <span className="text-white font-semibold">{feature.count}</span>
                  <span className="text-white/70 text-sm">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Neighborhood Section - Premium Grid */}
      <section className="py-16 md:py-20">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
              Neighborhood
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything Within Reach
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              {location.neighborhood} is one of {location.city}'s most desirable neighborhoods,
              offering convenient access to world-class amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyLocations.map((category, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-stone-100">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${category.color}-500/20 to-${category.color}-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className={`w-6 h-6 text-${category.color}-500`} style={{ color: category.color === 'emerald' ? '#10b981' : category.color === 'blue' ? '#3b82f6' : category.color === 'rose' ? '#f43f5e' : category.color === 'amber' ? '#f59e0b' : category.color === 'green' ? '#22c55e' : '#64748b' }} />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">{category.category}</h3>
                </div>

                {/* Places List */}
                <ul className="space-y-4">
                  {category.places.map((place, j) => (
                    <li key={j} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate">{place.name}</p>
                        <p className="text-xs text-text-muted">{place.type}</p>
                      </div>
                      <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
                        <Clock className="w-3 h-3" />
                        {place.distance}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Location */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80"
                    alt="Casco Viejo"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                    alt="Shopping"
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
                    alt="Cinta Costera"
                    className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"
                    alt="Fine Dining"
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
                Why This Location
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                The Perfect Address for Modern Living
              </h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                {location.neighborhood} offers the ideal balance of urban sophistication and residential tranquility.
                With tree-lined streets, premium dining options, and easy access to business districts,
                it's where Panama's most discerning residents choose to call home.
              </p>

              <div className="space-y-4">
                {[
                  { title: 'Prime Business Access', desc: '5 minutes to the banking district' },
                  { title: 'International Connectivity', desc: '25 minutes to Tocumen Airport' },
                  { title: 'Urban Amenities', desc: 'Walking distance to parks, cafés, and shops' },
                  { title: 'Safe & Prestigious', desc: 'One of Panama City\'s most sought-after areas' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary via-primary to-primary-dark">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Ready to Explore Available Units?
              </h2>
              <p className="text-white/70 max-w-md">
                Browse our interactive map and discover your perfect suite in this prime location.
              </p>
            </div>
            <Link
              to="/building"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:shadow-xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Explore Units
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
