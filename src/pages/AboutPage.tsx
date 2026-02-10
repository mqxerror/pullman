import { Link } from 'react-router-dom'
import { projectConfig } from '@/config/project'
import { Check, Building2, Sun, MapPin, ChevronRight } from 'lucide-react'
import { GalleryImage } from '@/components/LazyImage'
import Footer from '@/components/Footer'
import MainNav from '@/components/MainNav'
import LocationMap from '@/components/LocationMap'
// Aceternity UI Components
import { TextGenerateEffect, BentoGrid, BentoGridItem, HoverBorderGradient, BackgroundBeams } from '@/components/ui'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero - Enhanced with Aceternity */}
      <section id="main-content" className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={projectConfig.media.heroImage}
            alt={projectConfig.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <BackgroundBeams className="opacity-30" />
        <div className="relative h-full flex items-end z-10">
          <div className="page-container pb-12">
            <p className="text-accent text-sm font-medium tracking-wider uppercase mb-3">
              About the Project
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              <TextGenerateEffect words={projectConfig.name} className="text-white" filter={false} duration={0.8} />
            </h1>
          </div>
        </div>
      </section>

      {/* Project Story */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-4 md:mb-6">
                A New Standard in Urban Living
              </h2>
              <p className="text-text-secondary mb-4 text-sm md:text-base">
                {projectConfig.name} represents the pinnacle of modern residential development in {projectConfig.location.city}. Rising {projectConfig.building.totalFloors} floors above the vibrant {projectConfig.location.neighborhood} district, this architectural masterpiece offers an unparalleled living experience.
              </p>
              <p className="text-text-secondary mb-6 text-sm md:text-base">
                Every detail has been thoughtfully designed to provide residents with the perfect balance of luxury, comfort, and convenience. From the moment you enter the grand lobby to the stunning views from your private residence, excellence is evident at every turn.
              </p>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{projectConfig.building.totalFloors}</p>
                  <p className="text-xs md:text-sm text-text-muted">Floors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{projectConfig.building.totalUnits}</p>
                  <p className="text-xs md:text-sm text-text-muted">Residences</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{projectConfig.building.completionYear}</p>
                  <p className="text-xs md:text-sm text-text-muted">Completion</p>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] lg:aspect-[4/5] rounded-2xl overflow-hidden order-first lg:order-last">
              <img
                src="/assets/gallery/lobby.jpg"
                alt="Lobby"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities - BentoGrid Layout */}
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

          <BentoGrid className="md:grid-cols-3 md:auto-rows-auto">
            {/* Building Amenities */}
            <BentoGridItem
              className="bg-white hover:bg-stone-50"
              title="Hotel Amenities"
              description={
                <ul className="space-y-2 mt-2">
                  {projectConfig.amenities.hotelAmenities.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="text-xs text-stone-600">{item}</span>
                    </li>
                  ))}
                </ul>
              }
              header={
                <div className="flex items-center justify-center h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
              }
            />

            {/* Interior Amenities */}
            <BentoGridItem
              className="bg-white hover:bg-stone-50"
              title="Suite Features"
              description={
                <ul className="space-y-2 mt-2">
                  {projectConfig.amenities.suiteFeatures.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="text-xs text-stone-600">{item}</span>
                    </li>
                  ))}
                </ul>
              }
              header={
                <div className="flex items-center justify-center h-16 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5">
                  <Sun className="w-8 h-8 text-accent" />
                </div>
              }
            />

            {/* Nearby */}
            <BentoGridItem
              className="bg-white hover:bg-stone-50"
              title="Nearby"
              description={
                <ul className="space-y-2 mt-2">
                  {projectConfig.amenities.nearby.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="text-xs text-stone-600">{item}</span>
                    </li>
                  ))}
                </ul>
              }
              header={
                <div className="flex items-center justify-center h-16 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5">
                  <MapPin className="w-8 h-8 text-secondary" />
                </div>
              }
            />
          </BentoGrid>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-accent text-xs md:text-sm font-medium tracking-wider uppercase mb-2 md:mb-3">
                Prime Location
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3 md:mb-4">
                {projectConfig.location.neighborhood}
              </h2>
              <p className="text-text-secondary mb-4 md:mb-6 text-sm md:text-base">
                Located in the prestigious {projectConfig.location.neighborhood} district of {projectConfig.location.city}, {projectConfig.name} offers unmatched convenience with easy access to the city's best shopping, dining, and entertainment destinations.
              </p>
              <div className="bg-background rounded-xl p-3 md:p-4 border border-border">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{projectConfig.location.address}</p>
                    <p className="text-xs text-text-muted mt-0.5">{projectConfig.location.city}, {projectConfig.location.country}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-video lg:aspect-[4/3] bg-stone-200 rounded-2xl overflow-hidden">
              <LocationMap />
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Enhanced */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="page-container text-center relative z-10">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Ready to Explore?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Browse our available units and find your perfect residence.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/building">
              <HoverBorderGradient
                containerClassName="rounded-xl"
                className="flex items-center gap-2 px-6 py-3 bg-white text-primary font-medium"
              >
                Explore Units
                <ChevronRight className="w-4 h-4" />
              </HoverBorderGradient>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
