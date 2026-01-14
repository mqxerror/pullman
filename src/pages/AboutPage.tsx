import { Link } from 'react-router-dom'
import { projectConfig } from '@/config/project'
import { Check, Building2, Sun, MapPin, ChevronRight } from 'lucide-react'
import { GalleryImage } from '@/components/LazyImage'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="page-container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="https://www.mercan.com/wp-content/uploads/2024/06/logo.png"
                alt="Mercan Group"
                className="h-14 w-auto"
              />
            </Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link to="/building" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                Explore
              </Link>
              <Link to="/location" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                Location
              </Link>
              <Link to="/about" className="text-sm text-primary font-medium">
                About
              </Link>
              <Link to="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors font-medium">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="main-content" className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src={projectConfig.media.heroImage}
            alt={projectConfig.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex items-end">
          <div className="page-container pb-12">
            <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
              About the Project
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {projectConfig.name}
            </h1>
          </div>
        </div>
      </section>

      {/* Project Story */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-text-primary mb-6">
                A New Standard in Urban Living
              </h2>
              <p className="text-text-secondary mb-4">
                {projectConfig.name} represents the pinnacle of modern residential development in {projectConfig.location.city}. Rising {projectConfig.building.totalFloors} floors above the vibrant {projectConfig.location.neighborhood} district, this architectural masterpiece offers an unparalleled living experience.
              </p>
              <p className="text-text-secondary mb-6">
                Every detail has been thoughtfully designed to provide residents with the perfect balance of luxury, comfort, and convenience. From the moment you enter the grand lobby to the stunning views from your private residence, excellence is evident at every turn.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{projectConfig.building.totalFloors}</p>
                  <p className="text-sm text-text-muted">Floors</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{projectConfig.building.totalUnits}</p>
                  <p className="text-sm text-text-muted">Residences</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{projectConfig.building.completionYear}</p>
                  <p className="text-sm text-text-muted">Completion</p>
                </div>
              </div>
            </div>
            <div className="aspect-[4/5] rounded-2xl overflow-hidden">
              <img
                src="/assets/gallery/lobby.jpg"
                alt="Lobby"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-16 bg-surface">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
              World-Class Amenities
            </p>
            <h2 className="text-3xl font-semibold text-text-primary">
              Everything You Need, All in One Place
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Building Amenities */}
            <div className="bg-background rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Hotel Amenities</h3>
              <ul className="space-y-3">
                {projectConfig.amenities.hotelAmenities.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interior Amenities */}
            <div className="bg-background rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Suite Features</h3>
              <ul className="space-y-3">
                {projectConfig.amenities.suiteFeatures.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearby */}
            <div className="bg-background rounded-2xl p-6 border border-border">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Nearby</h3>
              <ul className="space-y-3">
                {projectConfig.amenities.nearby.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
              Gallery
            </p>
            <h2 className="text-3xl font-semibold text-text-primary">
              Experience the Lifestyle
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectConfig.media.gallery.map((image, i) => (
              <GalleryImage
                key={i}
                src={typeof image === 'string' ? image : image.src}
                alt={typeof image === 'string' ? `${projectConfig.name} gallery image ${i + 1}` : image.alt}
                className="aspect-[4/3] rounded-xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-16 bg-surface">
        <div className="page-container">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
                Prime Location
              </p>
              <h2 className="text-3xl font-semibold text-text-primary mb-4">
                {projectConfig.location.neighborhood}
              </h2>
              <p className="text-text-secondary mb-6">
                Located in the prestigious {projectConfig.location.neighborhood} district of {projectConfig.location.city}, {projectConfig.name} offers unmatched convenience with easy access to the city's best shopping, dining, and entertainment destinations.
              </p>
              <div className="bg-background rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{projectConfig.location.address}</p>
                    <p className="text-xs text-text-muted mt-0.5">{projectConfig.location.city}, {projectConfig.location.country}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] bg-stone-200 rounded-2xl overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.5!2d${projectConfig.location.coordinates.lng}!3d${projectConfig.location.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMDAnMjkuNSJOIDc5wrAzMCcxMi4yIlc!5e0!3m2!1sen!2sus!4v1702000000000!5m2!1sen!2sus`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${projectConfig.name} location map`}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="page-container text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Browse our available units or speak with our sales team to find your perfect residence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/building"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium rounded-xl hover:bg-white/90 transition-colors"
            >
              Explore Units
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
