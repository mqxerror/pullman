# Product Requirements Document: Pullman Hotel & Casino Panama

## Document Information
| Field | Value |
|-------|-------|
| **Project Name** | Pullman Hotel & Casino Panama - Sales Website |
| **Version** | 1.0 |
| **Created** | January 13, 2026 |
| **Last Updated** | January 13, 2026 |
| **Author** | Product Management |
| **Status** | Draft |

---

## 1. Executive Summary

### 1.1 Product Vision
A premium real estate sales website for the Pullman Hotel & Casino Panama development, enabling prospective investors to explore Executive Suites through an immersive, highly realistic building visualization with future 360-degree virtual tour integration.

### 1.2 Business Context
Mercan Properties, in partnership with Accor (Pullman brand), is renovating an existing tower in Panama City into a luxury hotel with casino and investable Executive Suites. The website serves as the primary digital sales tool for international investors seeking branded hotel investment opportunities.

### 1.3 Key Stakeholders
| Stakeholder | Role |
|-------------|------|
| Mercan Properties | Developer / Property Owner |
| Accor / Pullman | Hotel Brand Partner |
| Mallol Arquitectos | Architect |
| Sales Team | Primary users for client presentations |
| International Investors | Target audience |

---

## 2. Problem Statement

### 2.1 Current Situation
- Mercan Properties has a new hotel investment opportunity (Pullman Hotel & Casino Panama)
- Source materials exist (floor plans, renders, drone footage, technical sheets)
- No dedicated sales website exists for this property
- Existing Santa Maria Residences website provides a proven template but needs significant adaptation

### 2.2 Pain Points
1. **No digital presence** for Pullman property sales
2. **Complex unit layouts** (14 units per floor vs 6) require new visualization approach
3. **Different product type** (hotel investment vs residential) needs different messaging
4. **Brand partnership** (Accor/Pullman) requires brand compliance
5. **International investors** need professional, trustworthy digital experience

### 2.3 Opportunity
Create a world-class real estate sales platform that:
- Showcases the Pullman brand prestige
- Provides hyper-realistic building visualization
- Enables 360-degree virtual suite tours (future phase)
- Captures and qualifies investor leads

---

## 3. Target Users

### 3.1 Primary Persona: International Hotel Investor
| Attribute | Description |
|-----------|-------------|
| **Demographics** | High-net-worth individuals, 40-65 years old |
| **Geography** | North America, Europe, Middle East, Asia |
| **Investment Range** | $150,000 - $500,000 USD |
| **Motivation** | Passive income through hotel management, brand security (Accor), Panama tax benefits |
| **Tech Comfort** | Moderate - expects premium digital experience |
| **Decision Process** | Research online, verify credentials, schedule call, visit property |

### 3.2 Secondary Persona: Sales Agent
| Attribute | Description |
|-----------|-------------|
| **Role** | Mercan Properties sales team |
| **Use Case** | Client presentations, virtual tours, availability checking |
| **Needs** | Real-time availability, easy navigation, impressive visuals |

---

## 4. Product Requirements

### 4.1 Core Features

#### F1: Immersive Landing Experience
| ID | Requirement | Priority |
|----|-------------|----------|
| F1.1 | Hero section with cinematic property visuals | Must Have |
| F1.2 | Pullman/Accor brand integration (logo, colors) | Must Have |
| F1.3 | Value proposition messaging for hotel investors | Must Have |
| F1.4 | Primary CTA for suite exploration | Must Have |
| F1.5 | Drone footage integration | Should Have |

#### F2: Interactive Building Selector (Premium Visualization)
| ID | Requirement | Priority |
|----|-------------|----------|
| F2.1 | Hyper-realistic building facade rendering | Must Have |
| F2.2 | Floor selection (Floors 17-25 for Executive Suites) | Must Have |
| F2.3 | 14-unit per floor layout visualization | Must Have |
| F2.4 | Unit availability status (Available, Reserved, Sold) | Must Have |
| F2.5 | Hover/click interactions with smooth animations | Must Have |
| F2.6 | Real-time availability sync with database | Must Have |
| F2.7 | 360-degree panoramic integration (Phase 2) | Should Have |

#### F3: Suite Detail Views
| ID | Requirement | Priority |
|----|-------------|----------|
| F3.1 | Floor plan display per suite type | Must Have |
| F3.2 | Suite specifications (size, layout, features) | Must Have |
| F3.3 | Interior renders/photos | Must Have |
| F3.4 | Price indication or "Contact for pricing" | Must Have |
| F3.5 | 360-degree interior tour (Phase 2) | Should Have |

#### F4: Investment Information
| ID | Requirement | Priority |
|----|-------------|----------|
| F4.1 | Hotel management program details | Must Have |
| F4.2 | Expected returns / investment model | Should Have |
| F4.3 | Pullman brand benefits | Must Have |
| F4.4 | Panama investment advantages | Should Have |
| F4.5 | Developer track record (Mercan) | Must Have |

#### F5: Property & Location
| ID | Requirement | Priority |
|----|-------------|----------|
| F5.1 | Building amenities (casino, restaurants, pool, etc.) | Must Have |
| F5.2 | Location map with points of interest | Must Have |
| F5.3 | Panama City highlights | Should Have |
| F5.4 | Construction progress/timeline | Should Have |

#### F6: Lead Capture & Contact
| ID | Requirement | Priority |
|----|-------------|----------|
| F6.1 | Contact form with qualification questions | Must Have |
| F6.2 | Direct phone/WhatsApp integration | Must Have |
| F6.3 | Meeting scheduler integration | Should Have |
| F6.4 | Lead notification to sales team | Must Have |
| F6.5 | CRM integration capability | Should Have |

### 4.2 Non-Functional Requirements

#### Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR1 | Initial page load | < 3 seconds |
| NFR2 | Building visualization load | < 2 seconds |
| NFR3 | Interaction response time | < 100ms |
| NFR4 | Mobile performance score | > 80 (Lighthouse) |

#### Compatibility
| ID | Requirement | Target |
|----|-------------|--------|
| NFR5 | Browser support | Chrome, Safari, Firefox, Edge (latest 2 versions) |
| NFR6 | Mobile responsive | iOS Safari, Android Chrome |
| NFR7 | Minimum viewport | 320px width |

#### Security & Privacy
| ID | Requirement | Target |
|----|-------------|--------|
| NFR8 | HTTPS enforcement | Required |
| NFR9 | Form data encryption | Required |
| NFR10 | GDPR compliance | Required |

---

## 5. Building & Unit Structure

### 5.1 Executive Suites (Floors 17-25)

**Floor Layout:** 14 units per floor
**Total Units:** 126 Executive Suites (14 units × 9 floors)

| Unit # | Size (m²) | Unit # | Size (m²) |
|--------|-----------|--------|-----------|
| 1 | 53.35 | 8 | 65.55 |
| 2 | 85.15 | 9 | 82.25 |
| 3 | 54.30 | 10 | 64.53 |
| 4 | 53.53 | 11 | 74.46 |
| 5 | 56.80 | 12 | 63.80 |
| 6 | 63.80 | 13 | 56.88 |
| 7 | 74.46 | 14 | 53.53 |

**Floor Area:** ~1,234.56 m² per floor
**Common Areas:** Services/Elevators/Stairs: 167.41 m², Corridors: 153.27 m²

### 5.2 Hotel Component (Lower Floors)
- Standard hotel rooms (managed by Accor/Pullman)
- Not available for individual sale
- Displayed for context in building visualization

### 5.3 Amenities
- Casino
- Lobby & Reception
- Restaurants
- Pool/Rooftop amenities
- Parking facilities

---

## 6. Technical Architecture

### 6.1 Technology Stack (Recommended)
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React + TypeScript | Proven with Santa Maria, component reuse |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Build | Vite | Fast development experience |
| Database | Supabase (PostgreSQL) | Real-time availability, existing infrastructure |
| Hosting | Docker / Cloud | Scalable deployment |
| 360° Tours | Pannellum or similar | Phase 2 integration |

### 6.2 Data Model

```
executive_suites
├── id (UUID)
├── floor (INTEGER) - 17-25
├── unit_number (INTEGER) - 1-14
├── unit_type (VARCHAR) - maps to size category
├── size_sqm (DECIMAL)
├── status (ENUM) - available, reserved, sold
├── price_usd (DECIMAL) - nullable
├── notes (TEXT)
├── updated_at (TIMESTAMP)
└── updated_by (VARCHAR)
```

### 6.3 Integration Points
| System | Purpose | Priority |
|--------|---------|----------|
| Supabase | Unit availability & status | Must Have |
| WhatsApp Business | Direct contact | Must Have |
| Google Analytics | Traffic & conversion tracking | Must Have |
| CRM (TBD) | Lead management | Should Have |
| 360° Platform | Virtual tours | Phase 2 |

---

## 7. Design Requirements

### 7.1 Brand Guidelines
| Element | Specification |
|---------|---------------|
| Primary Brand | Pullman (Accor ALL ecosystem) |
| Secondary Brand | Mercan Properties |
| Color Palette | Pullman brand colors (to be confirmed with Accor) |
| Typography | Premium, modern sans-serif (brand compliant) |
| Imagery | High-end hospitality, luxury investment |

### 7.2 Visual Design Principles
1. **Premium & Trustworthy** - Convey security of branded hotel investment
2. **Hyper-Realistic** - Building visualization should feel tangible
3. **Clean & Professional** - Appeal to sophisticated investors
4. **Brand Harmony** - Seamless Pullman/Mercan co-branding

### 7.3 Key Visual Elements
- Cinematic drone footage integration
- Photorealistic building renders
- Professional floor plans
- Interior suite renders
- Location/lifestyle photography

---

## 8. Success Metrics

### 8.1 Primary KPIs
| Metric | Target | Measurement |
|--------|--------|-------------|
| Lead Generation | 50+ qualified leads/month | Form submissions |
| Engagement | 3+ minutes avg session | Analytics |
| Conversion Rate | 5%+ visitor to lead | Analytics |
| Bounce Rate | < 40% | Analytics |

### 8.2 Secondary KPIs
| Metric | Target | Measurement |
|--------|--------|-------------|
| Building Selector Usage | 70%+ of sessions | Event tracking |
| Mobile Traffic | 40%+ | Analytics |
| Page Load Performance | < 3s | Lighthouse |

---

## 9. Project Phases

### Phase 1: MVP Launch
**Timeline:** TBD
**Scope:**
- Landing page with hero section
- Interactive building selector (14-unit layout)
- Suite detail pages
- Investment information
- Contact/lead capture
- Basic availability system

### Phase 2: Enhanced Experience
**Timeline:** TBD
**Scope:**
- 360-degree suite tours
- Virtual tour integration
- Enhanced animations
- CRM integration
- Multi-language support

### Phase 3: Advanced Features
**Timeline:** TBD
**Scope:**
- Investment calculator
- Document download portal
- Client portal
- Advanced analytics

---

## 10. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Brand approval delays (Accor) | High | Medium | Early brand guideline request |
| 360° content not ready | Medium | Medium | Design for graceful degradation |
| Complex floor layout visualization | Medium | High | Prototype early, test usability |
| Construction timeline changes | Low | Medium | Dynamic content management |

---

## 11. Open Questions

1. **Brand Guidelines:** Do we have official Pullman brand guidelines and assets?
2. **Pricing Display:** Should prices be shown publicly or "Contact for pricing"?
3. **Language:** Primary language? Multi-language support needed?
4. **360° Content:** Timeline for 360-degree studio photography?
5. **CRM:** Which CRM system for lead management?
6. **Domain:** What domain will the site use?

---

## 12. Appendix

### 12.1 Source Materials Location
```
docs/content/source-materials/
├── 260108_MER _ Minuta.pdf
├── 260108_PRE01_DE-selected/
│   ├── 260108_MER_PRE 01 TIMELINE.pdf
│   └── 260108_MER_RENDERS BATCH 03 PREVIEW.pdf
├── PAQUETE DE VENTAS/
│   ├── DRONE FLIGHT/ (100+ drone photos)
│   ├── RENDERS/
│   └── TECHNICAL SHEETS/
│       ├── EXECUTIVE SUITES/
│       │   ├── ENG/ (8 PDF floor plans)
│       │   └── ESP/ (8 PDF floor plans)
│       └── HOTEL/
│           ├── ENG/
│           └── ESP/
```

### 12.2 Reference Project
- Santa Maria Residences website (existing Mercan project)
- Similar architecture, different unit layout and branding

### 12.3 Key Differentiators from Santa Maria
| Aspect | Santa Maria | Pullman |
|--------|-------------|---------|
| Product Type | Residential apartments | Hotel investment suites |
| Units per floor | 6 | 14 |
| Floors | 35 (7-41) | 9 (17-25) |
| Brand | Independent | Pullman/Accor |
| Building | New construction | Renovation |
| Amenities | Residential | Casino, hotel services |

---

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-13 | PM | Initial draft |
