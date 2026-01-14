// Pullman Hotel - Database Types

export type SuiteStatus = 'available' | 'reserved' | 'sold'

export interface ExecutiveSuite {
  id: string
  floor: number
  unit_number: number
  size_sqm: number
  suite_type: string
  status: SuiteStatus
  price_usd: number | null
  price_display: string
  notes: string | null
  floor_plan_url: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

// Alias for backward compatibility with cloned components
export type Apartment = ExecutiveSuite
export type ApartmentStatus = SuiteStatus

// Tour types for 360° viewer
export interface Tour {
  id: string
  suite_type: string
  name: string
  description: string | null
  source: 'ai' | 'photo' | 'render'
  is_active: boolean
  created_at: string
  scenes?: TourScene[]
}

export interface TourScene {
  id: string
  tour_id: string
  name: string
  display_name: string | null
  panorama_url: string
  thumbnail_url: string | null
  initial_pitch: number
  initial_yaw: number
  initial_hfov: number
  sort_order: number
  hotspots?: TourHotspot[]
}

export interface TourHotspot {
  id: string
  scene_id: string
  target_scene_id: string | null
  pitch: number
  yaw: number
  label: string
  hotspot_type: 'navigation' | 'info' | 'link'
}

// Floor statistics
export interface FloorStats {
  floor: number
  total: number
  available: number
  reserved: number
  sold: number
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      pullman_suites: {
        Row: ExecutiveSuite
        Insert: Omit<ExecutiveSuite, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ExecutiveSuite, 'id'>>
      }
      tours: {
        Row: Tour
        Insert: Omit<Tour, 'id' | 'created_at'>
        Update: Partial<Omit<Tour, 'id'>>
      }
      tour_scenes: {
        Row: TourScene
        Insert: Omit<TourScene, 'id' | 'created_at'>
        Update: Partial<Omit<TourScene, 'id'>>
      }
      tour_hotspots: {
        Row: TourHotspot
        Insert: Omit<TourHotspot, 'id' | 'created_at'>
        Update: Partial<Omit<TourHotspot, 'id'>>
      }
    }
    Views: {
      pullman_floor_summary: {
        Row: FloorStats
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
