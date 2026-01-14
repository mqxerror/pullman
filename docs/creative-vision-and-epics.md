# Pullman Hotel - Creative Vision, Technical Plan & Epics

**Date:** 2026-01-13
**Project:** Pullman Hotel & Casino Panama - Sales Website
**Type:** Clone + Enhancement from Santa Maria Residences

---

## Part A: Epics & User Stories (Delta-Focused)

### Epic Overview

| Epic | Focus | Clone/New | Effort |
|------|-------|-----------|--------|
| Epic 1 | Project Setup & Clone | Clone + Config | Low |
| Epic 2 | Premium Building Visualizer | **NEW** | High |
| Epic 3 | 360° Virtual Tour System | **NEW** | Medium |
| Epic 4 | Premium Landing Experience | Enhanced | Medium |
| Epic 5 | Admin Dashboard & Data | Clone + Adapt | Low |

---

### Epic 1: Project Setup & Clone Foundation

**Goal:** Clone Santa Maria codebase and configure for Pullman

#### Story 1.1: Clone and Initialize Project
**As a** developer
**I want** to clone the Santa Maria codebase and rebrand for Pullman
**So that** we have a working foundation to build upon

**Acceptance Criteria:**
- [ ] Clone Santa Maria repo to new Pullman project
- [ ] Update package.json with new project name
- [ ] Replace all "Santa Maria" text references with "Pullman"
- [ ] Update color scheme to Pullman brand (get from brand guidelines)
- [ ] Replace Mercan logo references with Pullman/Accor dual branding
- [ ] Verify build completes without errors

#### Story 1.2: Configure Supabase Schema
**As a** developer
**I want** to update the database schema for Pullman's 14-unit floor layout
**So that** the system correctly represents the Executive Suites

**Acceptance Criteria:**
- [ ] Create new `executive_suites` table with schema:
  ```sql
  CREATE TABLE executive_suites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor INTEGER NOT NULL CHECK (floor >= 17 AND floor <= 25),
    unit_number INTEGER NOT NULL CHECK (unit_number >= 1 AND unit_number <= 14),
    size_sqm DECIMAL(5,2) NOT NULL,
    status VARCHAR(10) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    price_usd DECIMAL(12,2),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(floor, unit_number)
  );
  ```
- [ ] Seed 126 units (9 floors × 14 units) with correct sizes from floor plan
- [ ] Update RLS policies for admin access
- [ ] Test CRUD operations via Supabase client

#### Story 1.3: Update TypeScript Types
**As a** developer
**I want** to update all TypeScript interfaces for the new data model
**So that** we have type safety across the application

**Acceptance Criteria:**
- [ ] Create `ExecutiveSuite` type with all fields
- [ ] Update all component props to use new types
- [ ] Ensure no TypeScript errors in build

---

### Epic 2: Premium Building Visualizer (THE CORE FEATURE)

**Goal:** Create an immersive, image-based building explorer with zoom animations

#### Story 2.1: High-Resolution Facade Component
**As a** potential investor
**I want** to see a beautiful, realistic image of the Pullman building
**So that** I feel confident about the quality of my investment

**Acceptance Criteria:**
- [ ] Integrate exterior facade render as main visualization
- [ ] Optimize image for web (WebP format, responsive srcset)
- [ ] AI upscale image to 4K resolution using Real-ESRGAN
- [ ] Implement lazy loading with blur placeholder
- [ ] Performance: Load time < 2 seconds on 4G

**Technical Notes:**
- Source: `RENDERS/BATCH 01/Exterior facade.jpg`
- Upscale tool: Real-ESRGAN or Topaz Gigapixel
- Output: 4K WebP with quality 85

#### Story 2.2: Interactive Floor Hotspots
**As a** potential investor
**I want** to hover over floors and see availability information
**So that** I can quickly identify investment opportunities

**Acceptance Criteria:**
- [ ] Map floor positions (17-25) onto facade image coordinates
- [ ] Create invisible clickable hotspots for each floor
- [ ] On hover: Show tooltip with floor number and availability stats
- [ ] On hover: Subtle highlight effect on floor area
- [ ] Keyboard accessible (arrow keys to navigate floors)
- [ ] Status colors: Green (available), Amber (mixed), Red (sold)

**Technical Notes:**
```typescript
// Floor position mapping (percentages of image)
const FLOOR_POSITIONS = {
  17: { top: 68, height: 4.5 },
  18: { top: 63.5, height: 4.5 },
  19: { top: 59, height: 4.5 },
  20: { top: 54.5, height: 4.5 },
  21: { top: 50, height: 4.5 },
  22: { top: 45.5, height: 4.5 },
  23: { top: 41, height: 4.5 },
  24: { top: 36.5, height: 4.5 },
  25: { top: 32, height: 4.5 },
};
```

#### Story 2.3: Framer Motion Zoom Animation
**As a** potential investor
**I want** to click a floor and see a smooth zoom animation toward it
**So that** the experience feels premium and cinematic

**Acceptance Criteria:**
- [ ] Install and configure Framer Motion
- [ ] On floor click: Animate zoom from 1x to 2.5x scale
- [ ] Zoom focuses on clicked floor (transform-origin adjustment)
- [ ] Animation duration: 800ms with easeOutCubic easing
- [ ] After zoom completes: Transition to floor detail view
- [ ] Back button: Reverse zoom animation to return

**Technical Implementation:**
```typescript
import { motion, useAnimation } from 'framer-motion';

const BuildingVisualizer = () => {
  const controls = useAnimation();
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  const handleFloorClick = async (floor: number) => {
    const floorPos = FLOOR_POSITIONS[floor];

    await controls.start({
      scale: 2.5,
      y: `-${floorPos.top - 30}%`,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
    });

    setSelectedFloor(floor);
  };

  return (
    <motion.div animate={controls} className="building-container">
      <img src="/assets/pullman-facade-4k.webp" />
      {/* Floor hotspots */}
    </motion.div>
  );
};
```

#### Story 2.4: Floor Detail Panel with 14-Unit Layout
**As a** potential investor
**I want** to see all 14 units on a floor with their status and sizes
**So that** I can select a specific unit to learn more

**Acceptance Criteria:**
- [ ] Display floor plan image for selected floor
- [ ] Overlay clickable unit markers on floor plan
- [ ] Show unit number, size, and status for each
- [ ] Color-code by availability status
- [ ] Click unit to open suite detail modal
- [ ] Show floor statistics (X available, Y reserved, Z sold)

**Technical Notes:**
- Source: `TECHNICAL SHEETS/01_EXECUTIVE SUITES N1700@2500.pdf`
- Extract floor plan as SVG or high-res PNG
- Map unit positions using coordinate system

#### Story 2.5: Suite Detail Modal
**As a** potential investor
**I want** to see detailed information about a specific suite
**So that** I can make an informed investment decision

**Acceptance Criteria:**
- [ ] Display suite interior render
- [ ] Show: Floor, Unit #, Size (m²), Status, Price (or "Contact")
- [ ] Display suite floor plan from technical sheets
- [ ] "View in 360°" button (connects to Epic 3)
- [ ] "Contact Sales" CTA with WhatsApp/phone
- [ ] "Download Brochure" link
- [ ] Keyboard: ESC to close

---

### Epic 3: 360° Virtual Tour System

**Goal:** Enable immersive virtual tours of Executive Suites

#### Story 3.1: Pannellum Integration
**As a** potential investor
**I want** to explore suites in 360° panoramic view
**So that** I can experience the space before visiting

**Acceptance Criteria:**
- [ ] Install pannellum-react library
- [ ] Create `PanoramaViewer` component
- [ ] Support equirectangular panorama images
- [ ] Touch/drag to rotate view
- [ ] Pinch to zoom on mobile
- [ ] Fullscreen mode support

**Technical Setup:**
```bash
npm install pannellum pannellum-react
```

```typescript
import { Pannellum } from 'pannellum-react';

const PanoramaViewer = ({ panoramaUrl, hotspots }) => (
  <Pannellum
    width="100%"
    height="500px"
    image={panoramaUrl}
    pitch={10}
    yaw={180}
    hfov={110}
    autoLoad
    showZoomCtrl
  >
    {hotspots.map(spot => (
      <Pannellum.Hotspot
        key={spot.id}
        type="info"
        pitch={spot.pitch}
        yaw={spot.yaw}
        text={spot.label}
      />
    ))}
  </Pannellum>
);
```

#### Story 3.2: AI-Generated 360° Panoramas (Phase 2)
**As a** developer
**I want** to generate 360° panoramas from existing interior renders
**So that** we can offer virtual tours before professional photography

**Acceptance Criteria:**
- [ ] Research and select AI panorama tool (see options below)
- [ ] Generate test panorama from Executive Suite Type 07 render
- [ ] Validate quality meets premium brand standards
- [ ] Create workflow for batch generation
- [ ] Store panoramas in Supabase Storage or CDN

**AI 360° Generation Options:**

| Tool | Type | Quality | Cost | Recommendation |
|------|------|---------|------|----------------|
| **Blockade Labs Skybox AI** | Dedicated 360° | High | Free tier + paid | **Best for this use case** |
| **LeiaPix Converter** | Depth + 3D | Medium | Free | Good for parallax effects |
| **Stable Diffusion + ControlNet** | Custom pipeline | Variable | Free (self-host) | Requires expertise |
| **DALL-E 3 / Midjourney** | General AI | Medium | Paid | Not optimized for 360° |
| **Polycam / Matterport** | Photogrammetry | Excellent | Requires photos | Best with actual property |

**Recommended Approach:**
1. **MVP:** Use static interior renders as "preview"
2. **Phase 2a:** Generate AI panoramas with Blockade Labs Skybox
3. **Phase 2b:** Replace with professional 360° photography when available

#### Story 3.3: Tour Navigation Hotspots
**As a** potential investor
**I want** to navigate between rooms within a suite
**So that** I can explore the full living space

**Acceptance Criteria:**
- [ ] Define hotspot schema (position, target scene, label)
- [ ] Place navigation hotspots (e.g., "View Kitchen", "View Bedroom")
- [ ] Click hotspot to transition to next panorama
- [ ] Smooth transition animation between scenes
- [ ] Breadcrumb showing current room

#### Story 3.4: 360° Placeholder/Coming Soon State
**As a** potential investor
**I want** to know when 360° tours will be available
**So that** I can return to experience them later

**Acceptance Criteria:**
- [ ] Create elegant "Coming Soon" state for tours
- [ ] Show suite render image as preview
- [ ] "Notify Me" email capture option
- [ ] Display expected availability date if known

---

### Epic 4: Premium Landing Experience

**Goal:** Create a luxurious first impression for high-net-worth investors

#### Story 4.1: Hero Section with Drone Media
**As a** potential investor
**I want** to be captivated by stunning visuals when I land on the site
**So that** I immediately recognize this as a premium investment

**Acceptance Criteria:**
- [ ] Hero with exterior facade render as background
- [ ] Option for drone footage slideshow (144 photos available)
- [ ] Pullman/Accor/Mercan co-branding
- [ ] Headline: Investment-focused value proposition
- [ ] Primary CTA: "Explore Executive Suites"
- [ ] Secondary CTA: "Download Investment Guide"
- [ ] Trust strip: 126 Suites | Floors 17-25 | From $XXX

#### Story 4.2: Investment Value Proposition Section
**As a** potential investor
**I want** to understand why this is a good investment
**So that** I feel confident proceeding

**Acceptance Criteria:**
- [ ] "Why Invest in Pullman Panama" section
- [ ] Pullman brand strength (Accor network)
- [ ] Hotel management program benefits
- [ ] Panama investment advantages
- [ ] Expected returns (if approved to display)
- [ ] Developer track record (Mercan)

#### Story 4.3: Amenities Showcase
**As a** potential investor
**I want** to see the hotel amenities my guests will enjoy
**So that** I understand the full value of the property

**Acceptance Criteria:**
- [ ] Casino highlight section
- [ ] Rooftop pool (use rooftop render)
- [ ] Lobby experience (use lobby render)
- [ ] Restaurant/dining options
- [ ] Location benefits

---

### Epic 5: Admin Dashboard & Data Management

**Goal:** Enable sales team to manage suite inventory

#### Story 5.1: Clone Admin Dashboard
**As a** sales agent
**I want** to see and manage all 126 Executive Suites
**So that** I can update availability in real-time

**Acceptance Criteria:**
- [ ] Clone Santa Maria admin dashboard components
- [ ] Update grid to show 14 units per floor
- [ ] Filter by floor (17-25), status, size range
- [ ] Sort by floor, unit number, size, status
- [ ] Bulk status update capability
- [ ] Notes/comments per unit

#### Story 5.2: Single-Click Status Update
**As a** sales agent
**I want** to quickly update a suite's status
**So that** availability is always accurate

**Acceptance Criteria:**
- [ ] Click suite to open status selector
- [ ] One-click: Available → Reserved → Sold
- [ ] Add optional note with status change
- [ ] Audit trail: Show who changed and when
- [ ] Optimistic UI update with React Query

---

## Part B: Technical Prototype - Building Visualizer

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BuildingExplorer.tsx                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Framer Motion Container                 │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              FacadeImage.tsx                         │  │  │
│  │  │  ┌─────────────────────────────────────────────┐    │  │  │
│  │  │  │         High-res facade (4K WebP)            │    │  │  │
│  │  │  │                                              │    │  │  │
│  │  │  │  ┌──────────────────────────────────────┐   │    │  │  │
│  │  │  │  │       FloorHotspots.tsx              │   │    │  │  │
│  │  │  │  │  [17][18][19][20][21][22][23][24][25]│   │    │  │  │
│  │  │  │  └──────────────────────────────────────┘   │    │  │  │
│  │  │  │                                              │    │  │  │
│  │  │  └─────────────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼ Click Floor                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  FloorDetailPanel.tsx                      │  │
│  │  ┌─────────────────────┬───────────────────────────────┐  │  │
│  │  │   FloorPlanView     │      UnitList                  │  │  │
│  │  │   (14-unit layout)  │      [Status cards]            │  │  │
│  │  └─────────────────────┴───────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼ Click Unit                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    SuiteDetailModal.tsx                    │  │
│  │  ┌─────────────────────┬───────────────────────────────┐  │  │
│  │  │   PanoramaViewer    │      SuiteInfo                 │  │  │
│  │  │   or ImageGallery   │      [Details + CTAs]          │  │  │
│  │  └─────────────────────┴───────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

```typescript
// src/components/building/BuildingExplorer.tsx
import { useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import FacadeImage from './FacadeImage';
import FloorHotspots from './FloorHotspots';
import FloorDetailPanel from './FloorDetailPanel';
import SuiteDetailModal from './SuiteDetailModal';

type View = 'building' | 'floor' | 'suite';

export default function BuildingExplorer() {
  const [view, setView] = useState<View>('building');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const controls = useAnimation();

  const handleFloorClick = async (floor: number) => {
    // Calculate zoom target based on floor position
    const floorY = FLOOR_POSITIONS[floor].top;

    // Animate zoom
    await controls.start({
      scale: 2.5,
      y: `${50 - floorY}%`,
      transition: {
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1] // easeOutCubic
      }
    });

    setSelectedFloor(floor);
    setView('floor');
  };

  const handleBack = async () => {
    if (view === 'suite') {
      setSelectedSuite(null);
      setView('floor');
    } else if (view === 'floor') {
      // Reverse zoom
      await controls.start({
        scale: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
      });
      setSelectedFloor(null);
      setView('building');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-900">
      {/* Building View with Zoom Animation */}
      <motion.div
        animate={controls}
        className="absolute inset-0 flex items-center justify-center"
        style={{ transformOrigin: 'center center' }}
      >
        <FacadeImage />
        <FloorHotspots
          onFloorClick={handleFloorClick}
          selectedFloor={selectedFloor}
          disabled={view !== 'building'}
        />
      </motion.div>

      {/* Floor Detail Panel (slides in from right) */}
      <AnimatePresence>
        {view === 'floor' && selectedFloor && (
          <FloorDetailPanel
            floor={selectedFloor}
            onSuiteClick={(suiteId) => {
              setSelectedSuite(suiteId);
              setView('suite');
            }}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>

      {/* Suite Detail Modal */}
      <AnimatePresence>
        {view === 'suite' && selectedSuite && (
          <SuiteDetailModal
            suiteId={selectedSuite}
            onClose={handleBack}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Animation Specifications

```typescript
// src/lib/animations.ts
export const ANIMATIONS = {
  zoom: {
    in: {
      scale: 2.5,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
    },
    out: {
      scale: 1,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    }
  },
  slideIn: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  modalScale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 }
  }
};
```

---

## Part C: 360° Integration Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                       360° Tour System                           │
│                                                                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │  Content Layer  │    │  Viewer Layer   │    │  Data Layer │ │
│  │                 │    │                 │    │             │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────┐ │ │
│  │ │ Real Photos │ │───▶│ │  Pannellum  │ │◀───│ │Supabase │ │ │
│  │ │ (Phase 2b)  │ │    │ │   Viewer    │ │    │ │ Storage │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────┘ │ │
│  │        │        │    │        │        │    │      │      │ │
│  │        ▼        │    │        ▼        │    │      ▼      │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────┐ │ │
│  │ │AI Generated │ │───▶│ │  Hotspot    │ │◀───│ │ Tours   │ │ │
│  │ │ (Phase 2a)  │ │    │ │ Navigation  │ │    │ │ Config  │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └─────────┘ │ │
│  │        │        │    │        │        │    │             │ │
│  │        ▼        │    │        ▼        │    │             │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │             │ │
│  │ │Static Render│ │───▶│ │  Fallback   │ │    │             │ │
│  │ │ (MVP)       │ │    │ │  Gallery    │ │    │             │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │             │ │
│  └─────────────────┘    └─────────────────┘    └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### AI 360° Generation Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                 AI Panorama Generation Pipeline                   │
│                                                                   │
│  1. INPUT: Existing Interior Renders                              │
│     └── EXECUTIVE SUITE_TYPE 07.jpg                              │
│     └── EXECUTIVE SUITE_TYPE 08.jpg                              │
│                                                                   │
│  2. PROCESS: Blockade Labs Skybox AI                             │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ Prompt: "Luxury hotel suite interior, Panama City view,  │  │
│     │         modern minimalist design, warm wood tones,       │  │
│     │         floor-to-ceiling windows, high-end furniture"    │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                   │
│  3. OUTPUT: Equirectangular Panorama (8192x4096)                 │
│     └── suite_type_07_living_360.jpg                             │
│     └── suite_type_07_bedroom_360.jpg                            │
│     └── suite_type_07_kitchen_360.jpg                            │
│                                                                   │
│  4. POST-PROCESS: Quality Enhancement                            │
│     └── AI upscaling if needed (Real-ESRGAN)                     │
│     └── Color correction to match brand                          │
│     └── Compression for web (WebP, quality 85)                   │
│                                                                   │
│  5. DEPLOY: Upload to Supabase Storage                           │
│     └── /tours/suite-type-07/living.webp                         │
│     └── /tours/suite-type-07/bedroom.webp                        │
│     └── Create tour config in database                           │
└──────────────────────────────────────────────────────────────────┘
```

### Blockade Labs Integration

```typescript
// scripts/generate-panoramas.ts
// Run this manually or via CI to generate AI panoramas

import { BlockadeLabsSDK } from '@blockadelabs/sdk';

const blockade = new BlockadeLabsSDK({
  api_key: process.env.BLOCKADE_LABS_API_KEY
});

const SUITE_PROMPTS = {
  'type-07-living': {
    prompt: `Luxury hotel executive suite living room,
             Panama City skyline through floor-to-ceiling windows,
             modern minimalist interior design,
             warm oak wood paneling, cream leather sofa,
             marble coffee table, ambient lighting,
             photorealistic, architectural visualization`,
    style: 'realistic_interior_room'
  },
  'type-07-bedroom': {
    prompt: `Luxury hotel executive suite bedroom,
             king size bed with premium linens,
             Panama City view through large windows,
             warm wood tones, soft ambient lighting,
             modern minimalist design, hotel luxury,
             photorealistic, architectural visualization`,
    style: 'realistic_interior_room'
  }
};

async function generatePanoramas() {
  for (const [name, config] of Object.entries(SUITE_PROMPTS)) {
    console.log(`Generating: ${name}`);

    const result = await blockade.generateSkybox({
      prompt: config.prompt,
      skybox_style_id: config.style,
      enhance_prompt: true
    });

    // Download and save
    const panorama = await fetch(result.file_url);
    // ... save to storage
  }
}
```

### Database Schema for Tours

```sql
-- Tours configuration
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_type VARCHAR(20) NOT NULL,  -- 'type-07', 'type-08', etc.
  name VARCHAR(100) NOT NULL,
  source VARCHAR(20) DEFAULT 'ai',  -- 'ai', 'photo', 'render'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual scenes within a tour
CREATE TABLE tour_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,        -- 'living', 'bedroom', 'kitchen'
  panorama_url TEXT NOT NULL,
  initial_pitch DECIMAL(5,2) DEFAULT 0,
  initial_yaw DECIMAL(5,2) DEFAULT 180,
  initial_hfov DECIMAL(5,2) DEFAULT 110
);

-- Navigation hotspots between scenes
CREATE TABLE tour_hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID REFERENCES tour_scenes(id) ON DELETE CASCADE,
  target_scene_id UUID REFERENCES tour_scenes(id),
  pitch DECIMAL(5,2) NOT NULL,
  yaw DECIMAL(5,2) NOT NULL,
  label VARCHAR(50) NOT NULL        -- 'View Kitchen', 'View Bedroom'
);
```

### React Hook for Tours

```typescript
// src/hooks/useTour.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface TourScene {
  id: string;
  name: string;
  panorama_url: string;
  initial_pitch: number;
  initial_yaw: number;
  initial_hfov: number;
  hotspots: {
    id: string;
    target_scene_id: string;
    pitch: number;
    yaw: number;
    label: string;
  }[];
}

interface Tour {
  id: string;
  suite_type: string;
  name: string;
  source: 'ai' | 'photo' | 'render';
  scenes: TourScene[];
}

export function useTour(suiteType: string) {
  return useQuery<Tour | null>({
    queryKey: ['tour', suiteType],
    queryFn: async () => {
      const { data: tour, error } = await supabase
        .from('tours')
        .select(`
          *,
          scenes:tour_scenes(
            *,
            hotspots:tour_hotspots(*)
          )
        `)
        .eq('suite_type', suiteType)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return tour;
    }
  });
}
```

---

## Implementation Priority & Timeline

### Phase 1: MVP (Foundation)
1. Story 1.1: Clone and initialize ✅
2. Story 1.2: Supabase schema ✅
3. Story 1.3: TypeScript types ✅
4. Story 2.1: High-res facade ✅
5. Story 2.2: Floor hotspots ✅
6. Story 5.1: Admin dashboard clone ✅

### Phase 2: Core Experience
1. Story 2.3: Zoom animation (Framer Motion)
2. Story 2.4: Floor detail panel
3. Story 2.5: Suite detail modal
4. Story 4.1: Hero section

### Phase 3: 360° Tours
1. Story 3.1: Pannellum integration
2. Story 3.4: Placeholder state
3. Story 3.2: AI panorama generation
4. Story 3.3: Tour navigation

### Phase 4: Polish
1. Story 4.2: Investment value prop
2. Story 4.3: Amenities showcase
3. Story 5.2: Status updates
4. Performance optimization

---

## Asset Checklist

### Have (Ready to Use)
- [x] Exterior facade render (high quality)
- [x] Executive Suite Type 07 interior render
- [x] Executive Suite Type 08 interior render
- [x] Lobby render
- [x] Rooftop pool render
- [x] Floor plan PDF (all 14 units)
- [x] 8 suite technical sheets
- [x] 144 drone photos

### Need (Action Required)
- [ ] Pullman brand guidelines & assets (request from Accor)
- [ ] 4K upscaled facade image (run through AI upscaler)
- [ ] Floor plan extracted as PNG/SVG
- [ ] Unit position coordinates mapped on facade
- [ ] AI-generated 360° panoramas (Phase 2)

---

**Document Created:** 2026-01-13
**Author:** John (Product Manager Agent)
**Status:** Ready for Implementation
