// Panama City Central - Project Configuration
// Executive Suites Sales Website

export const projectConfig = {
  // Basic Info
  name: 'Panama City Central',
  tagline: 'Premium Hotel Investment in the Heart of Panama City',
  description: '126 Executive Suites across 9 floors (17-25), managed by Pullman Hotels & Resorts, part of the Accor ALL ecosystem.',

  // Location
  location: {
    city: 'Panama City',
    country: 'Panama',
    neighborhood: 'Via España',
    address: 'Via España, Panama City',
    coordinates: {
      lat: 9.0082,
      lng: -79.5034,
    },
  },

  // Building Stats
  building: {
    totalFloors: 9, // All floors 17-25 (7 residential + 2 amenity)
    floorRange: { min: 17, max: 25 },
    totalUnits: 98, // 14 units × 7 residential floors
    unitsPerFloor: 14,
    unitTypes: ['Executive Suite'],
    completionYear: 2026,
    amenityFloors: [24, 25], // Pool, gym, sky lounge
    residentialFloors: 7, // Floors 17-23 have apartments
  },

  // Pricing
  pricing: {
    startingFrom: 'Contact for Pricing',
    pricePerSqm: 'Contact Sales',
    currency: 'USD',
  },

  // Contact
  contact: {
    phone: '+1-514-282-9214',
    whatsapp: '+1-514-282-9214',
    email: 'sales@pullmanpanama.com',
    salesOffice: 'Sales Gallery',
  },

  // Media
  media: {
    heroImage: '/assets/pullman-facade-v2.png',
    heroVideo: null,
    logo: '/assets/pullman-logo.png',
    gallery: [
      { src: '/assets/gallery/suite-type-07.jpg', alt: 'Executive Suite living room with panoramic Panama City views' },
      { src: '/assets/gallery/suite-type-08.jpg', alt: 'Executive Suite interior with modern design and city views' },
      { src: '/assets/gallery/lobby.jpg', alt: 'Panama City Central lobby with premium finishes' },
      { src: '/assets/gallery/rooftop-pool.jpg', alt: 'Rooftop pool with stunning city panorama' },
    ],
  },

  // Branding
  branding: {
    primary: 'Pullman Hotels & Resorts',
    parent: 'Accor',
    developer: 'Mercan Properties',
    colors: {
      primary: '#1a1a2e',    // Pullman dark blue/black
      accent: '#c9a227',      // Gold accent
      secondary: '#4a4a4a',
    },
  },

  // Highlights (for landing page)
  highlights: [
    {
      title: 'Pullman Brand',
      description: 'Part of Accor ALL ecosystem with global reach and loyalty program',
      icon: 'Award',
    },
    {
      title: 'Hotel Management',
      description: 'Professional hotel management with rental income potential',
      icon: 'TrendingUp',
    },
    {
      title: 'Premium Location',
      description: 'Via España - Panama City\'s prime commercial corridor',
      icon: 'MapPin',
    },
    {
      title: 'World-Class Amenities',
      description: 'Casino, rooftop pool, restaurants, and full hotel services',
      icon: 'Building2',
    },
  ],

  // Amenities
  amenities: {
    suiteFeatures: [
      'Floor-to-ceiling windows',
      'Premium finishes',
      'Full kitchen',
      'Smart home ready',
      'City views',
      'Hotel services access',
    ],
    hotelAmenities: [
      'Rooftop infinity pool',
      'Full-service casino',
      'Multiple restaurants',
      '24/7 room service',
      'Fitness center',
      'Business center',
      'Concierge services',
      'Valet parking',
    ],
    nearby: [
      'Banking district',
      'Shopping centers',
      'Metro stations',
      'International airport (25 min)',
      'Casco Viejo',
      'Panama Canal',
    ],
  },

  // Investment Info
  investment: {
    program: 'Hotel Management Program',
    benefits: [
      'Passive rental income',
      'Professional management',
      'Accor loyalty program inclusion',
      'Personal use flexibility',
      'Panama residency pathway',
    ],
  },

  // Social Links
  social: {
    instagram: null,
    facebook: null,
    linkedin: null,
  },
}

// Suite size data from official Excel spreadsheet (January 21, 2026)
// Source: "Copy of Standard Rooms and Executive Suites - Hotel - Areas - FD - 1-21-26.xlsx"
export const SUITE_SIZES: Record<number, number> = {
  1: 53.35,  // Type A LOCKOFF - Executive Suite
  2: 85.15,  // Type B - Premium Suite
  3: 54.30,  // Type A LOCKOFF - Executive Suite
  4: 53.53,  // Type A LOCKOFF - Executive Suite
  5: 56.88,  // Type C - Executive Suite
  6: 63.80,  // Type D - Deluxe Suite
  7: 74.46,  // Type E LOCKOFF - Deluxe Suite
  8: 65.55,  // Type E LOCKOFF - Deluxe Suite
  9: 85.25,  // Type B - Premium Suite
  10: 64.53, // Type E LOCKOFF - Deluxe Suite
  11: 74.46, // Type E LOCKOFF - Deluxe Suite
  12: 63.80, // Type D - Deluxe Suite
  13: 56.88, // Type C - Executive Suite
  14: 53.10, // Type A LOCKOFF - Executive Suite
}

export type ProjectConfig = typeof projectConfig
