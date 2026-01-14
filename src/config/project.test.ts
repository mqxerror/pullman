import { describe, it, expect } from 'vitest'
import { projectConfig, SUITE_SIZES } from './project'

describe('Project Configuration', () => {
  describe('Project Info', () => {
    it('should have project name', () => {
      expect(projectConfig.name).toBe('Pullman Hotel & Casino Panama')
    })

    it('should have tagline', () => {
      expect(projectConfig.tagline).toBeDefined()
      expect(typeof projectConfig.tagline).toBe('string')
    })
  })

  describe('Building Configuration', () => {
    it('should have correct floor configuration', () => {
      expect(projectConfig.building.totalFloors).toBe(9)
      expect(projectConfig.building.floorRange.min).toBe(17)
      expect(projectConfig.building.floorRange.max).toBe(25)
    })

    it('should have correct unit configuration', () => {
      expect(projectConfig.building.totalUnits).toBe(126)
      expect(projectConfig.building.unitsPerFloor).toBe(14)
    })

    it('should have consistent totals', () => {
      const calculatedTotal = projectConfig.building.totalFloors * projectConfig.building.unitsPerFloor
      expect(calculatedTotal).toBe(projectConfig.building.totalUnits)
    })
  })

  describe('Suite Sizes', () => {
    it('should have sizes for all 14 units', () => {
      expect(Object.keys(SUITE_SIZES)).toHaveLength(14)
    })

    it('should have valid size values', () => {
      Object.values(SUITE_SIZES).forEach((size) => {
        expect(size).toBeGreaterThan(0)
        expect(size).toBeLessThan(200) // Reasonable max size
      })
    })

    it('should have unit numbers 1-14', () => {
      for (let unit = 1; unit <= 14; unit++) {
        expect(SUITE_SIZES[unit]).toBeDefined()
      }
    })
  })

  describe('Contact Information', () => {
    it('should have phone number', () => {
      expect(projectConfig.contact.phone).toBeDefined()
    })

    it('should have email', () => {
      expect(projectConfig.contact.email).toBeDefined()
      expect(projectConfig.contact.email).toContain('@')
    })

    it('should have WhatsApp number', () => {
      expect(projectConfig.contact.whatsapp).toBeDefined()
    })
  })

  describe('Location', () => {
    it('should have address', () => {
      expect(projectConfig.location.address).toBeDefined()
    })

    it('should have valid coordinates', () => {
      expect(projectConfig.location.coordinates.lat).toBeGreaterThan(-90)
      expect(projectConfig.location.coordinates.lat).toBeLessThan(90)
      expect(projectConfig.location.coordinates.lng).toBeGreaterThan(-180)
      expect(projectConfig.location.coordinates.lng).toBeLessThan(180)
    })
  })

  describe('Investment Information', () => {
    it('should have investment program', () => {
      expect(projectConfig.investment.program).toBeDefined()
      expect(typeof projectConfig.investment.program).toBe('string')
    })

    it('should have benefits list', () => {
      expect(projectConfig.investment.benefits).toBeDefined()
      expect(Array.isArray(projectConfig.investment.benefits)).toBe(true)
      expect(projectConfig.investment.benefits.length).toBeGreaterThan(0)
    })
  })

  describe('Amenities', () => {
    it('should have suite features', () => {
      expect(projectConfig.amenities.suiteFeatures).toBeDefined()
      expect(Array.isArray(projectConfig.amenities.suiteFeatures)).toBe(true)
    })

    it('should have hotel amenities', () => {
      expect(projectConfig.amenities.hotelAmenities).toBeDefined()
      expect(Array.isArray(projectConfig.amenities.hotelAmenities)).toBe(true)
    })
  })

  describe('Media', () => {
    it('should have hero image path', () => {
      expect(projectConfig.media.heroImage).toBeDefined()
      expect(projectConfig.media.heroImage).toContain('/')
    })
  })
})
