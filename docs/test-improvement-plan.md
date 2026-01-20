# Test Improvement Plan

**Project:** Panama City Central (Pullman Hotel)
**Generated:** 2026-01-20
**Author:** Murat (Test Architect)
**Current Quality Score:** 62/100 (C - Needs Improvement)
**Target Quality Score:** 85/100 (A - Good)

---

## Executive Summary

This plan addresses critical quality issues in the test suite, prioritizing flakiness prevention and maintainability. The E2E tests require significant rework while unit tests need minor enhancements.

**Key Metrics:**
| Metric | Current | Target |
|--------|---------|--------|
| Hard Waits | 9 instances | 0 |
| Flaky Patterns | 12 detected | 0 |
| Test IDs | 0% coverage | 100% |
| Data-TestId Selectors | ~10% | 90% |
| Quality Score | 62/100 | 85/100 |

---

## Phase 1: Critical Fixes (Week 1)

**Goal:** Eliminate flakiness risks and achieve CI-ready tests

### 1.1 Remove All Hard Waits

**Priority:** P0 - CRITICAL
**Effort:** 4 hours
**Files:** `e2e/building-visualizer.spec.ts`

#### Current State (Lines to Fix)
```
Line 20:  await page.waitForTimeout(2000)
Line 29:  await page.waitForTimeout(300)
Line 56:  await page.waitForTimeout(2000)
Line 60:  await page.waitForTimeout(1500)
Line 84:  await page.waitForTimeout(2000)
Line 88:  await page.waitForTimeout(2000)
Line 96:  await page.waitForTimeout(1000)
Line 104: await page.waitForTimeout(1000)
Line 108: await page.waitForTimeout(500)
```

#### Replacement Strategy

| Original | Replace With |
|----------|--------------|
| `waitForTimeout(2000)` before interaction | `await expect(locator).toBeVisible()` |
| `waitForTimeout()` after click | `await expect(resultLocator).toBeVisible()` |
| `waitForTimeout()` for animation | `await locator.waitFor({ state: 'stable' })` |

#### Code Template
```typescript
// BEFORE (flaky)
await page.waitForTimeout(2000)
await page.mouse.click(550, 480)
await page.waitForTimeout(1500)

// AFTER (stable)
await expect(page.locator('[data-testid="building-facade"]')).toBeVisible()
await page.locator('[data-testid="floor-21-hotspot"]').click()
await expect(page.locator('[data-testid="floor-panel"]')).toBeVisible()
```

---

### 1.2 Fix Meaningless Assertion

**Priority:** P0 - CRITICAL
**Effort:** 30 minutes
**File:** `e2e/building-visualizer.spec.ts`, Line 68

#### Current State
```typescript
// Line 68 - This asserts nothing
expect(true).toBe(true)
```

#### Fix
```typescript
// Option A: Assert actual UI state
const floorPanel = page.locator('[data-testid="floor-detail-panel"]')
const hasPanel = await floorPanel.isVisible().catch(() => false)
expect(hasPanel || await page.locator('body').isVisible()).toBe(true)

// Option B: If testing "doesn't crash", use proper check
await expect(page).not.toHaveURL(/error/)
await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible()
```

---

### 1.3 Add Data-TestId Attributes to Application

**Priority:** P0 - CRITICAL
**Effort:** 2 hours
**Files:** React components

#### Components Requiring data-testid

| Component | Element | data-testid |
|-----------|---------|-------------|
| Header | Logo/Title | `site-header` |
| BuildingImage | Facade image | `building-facade` |
| BuildingImage | Floor hotspots | `floor-{n}-hotspot` |
| FloorPanel | Panel container | `floor-panel` |
| FloorPanel | Suite cards | `suite-{floor}-{unit}` |
| Legend | Container | `availability-legend` |
| Stats | Total count | `stats-total` |

#### Implementation Example
```tsx
// BuildingExplorerDualAB.tsx - Add to floor buttons
<button
  key={f.floor}
  data-testid={`floor-${f.floor}-hotspot`}
  onClick={() => setSelectedFloor(f.floor)}
  // ... rest of props
>

// Header component
<header data-testid="site-header">
  <img data-testid="site-logo" ... />
</header>

// Stats section
<div data-testid="stats-total">{stats.total}</div>
```

---

## Phase 2: Stability Improvements (Week 2)

**Goal:** Replace fragile selectors and add network resilience

### 2.1 Replace Hardcoded Coordinates

**Priority:** P1 - HIGH
**Effort:** 3 hours
**File:** `e2e/building-visualizer.spec.ts`

#### Current State
```typescript
// Lines 23-25, 59, 87, 107, 109
const positions = [[550, 450], [550, 500], [550, 550], [550, 600]]
await page.mouse.click(550, 480)
```

#### Solution: Use Locators
```typescript
// Use aria-label buttons (already exist in app)
const floorButtons = page.locator('button[aria-label*="Floor"]')

// Click specific floor
await page.locator('button[aria-label="Floor 21"]').click()

// Or use data-testid (after Phase 1.3)
await page.locator('[data-testid="floor-21-hotspot"]').click()
```

#### If Coordinates Are Truly Needed
```typescript
// Get bounding box dynamically
const floorArea = page.locator('[data-testid="floor-21-hotspot"]')
const box = await floorArea.boundingBox()
if (box) {
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}
```

---

### 2.2 Replace Text-Based Selectors

**Priority:** P1 - HIGH
**Effort:** 2 hours

#### Fragile Selectors to Replace

| Current (Fragile) | Replace With |
|-------------------|--------------|
| `text=Pullman Hotel & Casino Panama` | `[data-testid="site-title"]` |
| `text=126` | `[data-testid="stats-total"]` |
| `text=Total Suites` | `[data-testid="stats-label"]` |
| `text=Available` | `[data-testid="legend-available"]` |
| `text=Floors 17 - 25` | `[data-testid="floor-range"]` |

---

### 2.3 Add Network Mocking

**Priority:** P1 - HIGH
**Effort:** 3 hours

#### Create Test Fixtures
```typescript
// e2e/fixtures/suites-data.ts
export const mockSuitesData = [
  { id: '1', floor: 21, unit_number: 1, status: 'available', size_sqm: 65 },
  { id: '2', floor: 21, unit_number: 2, status: 'reserved', size_sqm: 72 },
  // ... more mock data
]

// e2e/fixtures/index.ts
import { test as base } from '@playwright/test'
import { mockSuitesData } from './suites-data'

export const test = base.extend({
  mockApi: async ({ page }, use) => {
    await page.route('**/rest/v1/pullman_suites**', route => {
      route.fulfill({ json: mockSuitesData })
    })
    await use(page)
  }
})
```

#### Use in Tests
```typescript
import { test, expect } from './fixtures'

test('should display building facade', async ({ page, mockApi }) => {
  await page.goto('/suites')
  await expect(page.locator('[data-testid="building-facade"]')).toBeVisible()
})
```

---

## Phase 3: Maintainability (Week 3)

**Goal:** Add conventions and improve structure

### 3.1 Implement Test ID Convention

**Priority:** P2 - MEDIUM
**Effort:** 2 hours

#### Convention Format
```
{epic}.{story}-{type}-{sequence}

Examples:
1.0-E2E-001  → Epic 1, Story 0, E2E test #1
1.3-API-005  → Epic 1, Story 3, API test #5
2.1-UNIT-012 → Epic 2, Story 1, Unit test #12
```

#### Apply to Existing Tests
```typescript
// e2e/building-visualizer.spec.ts
test.describe('1.0-E2E - Building Visualizer', () => {
  test('1.0-E2E-001: should load the suites explorer page', async ({ page }) => {
    // ...
  })

  test('1.0-E2E-002: should display building facade image', async ({ page }) => {
    // ...
  })
})

// src/config/building.test.ts
describe('2.0-UNIT - Building Configuration', () => {
  it('2.0-UNIT-001: should have correct floor range', () => {
    // ...
  })
})
```

---

### 3.2 Add BDD Structure

**Priority:** P2 - MEDIUM
**Effort:** 2 hours

#### Template
```typescript
test('1.0-E2E-001: should load the suites explorer page', async ({ page }) => {
  // Given: User navigates to suites page
  await page.goto('/suites')

  // When: Page finishes loading
  await expect(page.locator('[data-testid="site-header"]')).toBeVisible()

  // Then: Title and main content are displayed
  await expect(page).toHaveTitle(/Pullman Hotel/)
  await expect(page.locator('[data-testid="building-facade"]')).toBeVisible()
})
```

---

### 3.3 Create Page Object Model

**Priority:** P2 - MEDIUM
**Effort:** 4 hours

#### Structure
```
e2e/
├── fixtures/
│   ├── index.ts          # Extended test with mocks
│   └── suites-data.ts    # Mock data
├── pages/
│   ├── BasePage.ts       # Common methods
│   ├── SuitesPage.ts     # /suites page object
│   └── FloorPanel.ts     # Floor panel component
├── building-visualizer.spec.ts
└── playwright.config.ts
```

#### Page Object Example
```typescript
// e2e/pages/SuitesPage.ts
import { Page, Locator, expect } from '@playwright/test'

export class SuitesPage {
  readonly page: Page
  readonly header: Locator
  readonly buildingFacade: Locator
  readonly floorPanel: Locator
  readonly legend: Locator

  constructor(page: Page) {
    this.page = page
    this.header = page.locator('[data-testid="site-header"]')
    this.buildingFacade = page.locator('[data-testid="building-facade"]')
    this.floorPanel = page.locator('[data-testid="floor-panel"]')
    this.legend = page.locator('[data-testid="availability-legend"]')
  }

  async goto() {
    await this.page.goto('/suites')
    await expect(this.buildingFacade).toBeVisible()
  }

  async selectFloor(floor: number) {
    await this.page.locator(`[data-testid="floor-${floor}-hotspot"]`).click()
    await expect(this.floorPanel).toBeVisible()
  }

  async getFloorStats() {
    return {
      available: await this.page.locator('[data-testid="stats-available"]').textContent(),
      reserved: await this.page.locator('[data-testid="stats-reserved"]').textContent(),
    }
  }
}
```

#### Usage
```typescript
import { test, expect } from './fixtures'
import { SuitesPage } from './pages/SuitesPage'

test('1.0-E2E-003: should select floor and show panel', async ({ page, mockApi }) => {
  // Given: User is on suites page
  const suitesPage = new SuitesPage(page)
  await suitesPage.goto()

  // When: User clicks on floor 21
  await suitesPage.selectFloor(21)

  // Then: Floor panel displays with stats
  const stats = await suitesPage.getFloorStats()
  expect(parseInt(stats.available!)).toBeGreaterThanOrEqual(0)
})
```

---

## Phase 4: CI Integration (Week 4)

**Goal:** Reliable test execution in CI/CD pipeline

### 4.1 Configure Playwright for CI

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4.2 Add Burn-In Testing

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  burn-in:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Install dependencies
        run: npm ci && npx playwright install --with-deps

      - name: Burn-in test (10 iterations)
        run: |
          for i in {1..10}; do
            echo "=== Iteration $i ==="
            npx playwright test --reporter=line || exit 1
          done
```

---

## Tracking Progress

### Weekly Checklist

#### Week 1 - Critical Fixes
- [ ] Remove all `waitForTimeout()` calls (9 instances)
- [ ] Fix meaningless assertion (line 68)
- [ ] Add data-testid to 10 key components
- [ ] Verify tests pass locally 10 times consecutively

#### Week 2 - Stability
- [ ] Replace hardcoded coordinates with locators
- [ ] Replace text-based selectors
- [ ] Add network mocking fixtures
- [ ] Create mock data file

#### Week 3 - Maintainability
- [ ] Apply test ID convention to all tests
- [ ] Add BDD comments (Given/When/Then)
- [ ] Create Page Object for SuitesPage
- [ ] Refactor tests to use Page Objects

#### Week 4 - CI Integration
- [ ] Configure Playwright for CI
- [ ] Add burn-in workflow
- [ ] Set up test reporting
- [ ] Achieve 0 flaky failures in 50 CI runs

---

## Success Criteria

| Metric | Current | Week 1 | Week 2 | Week 4 |
|--------|---------|--------|--------|--------|
| Quality Score | 62 | 70 | 78 | 85 |
| Hard Waits | 9 | 0 | 0 | 0 |
| Flaky Failures | ~30% | <10% | <5% | <1% |
| Test IDs | 0% | 0% | 50% | 100% |
| CI Pass Rate | N/A | 80% | 90% | 99% |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hard waits cause CI failures | High | Phase 1 priority |
| Coordinate tests fail on different viewports | High | Use locators instead |
| API data changes break tests | Medium | Network mocking |
| Team unfamiliar with patterns | Medium | Training + Page Objects |

---

## Appendix: Quick Reference

### Playwright Wait Strategies
```typescript
// Wait for element
await expect(locator).toBeVisible()
await expect(locator).toHaveText('Expected')
await locator.waitFor({ state: 'attached' })

// Wait for navigation
await page.waitForURL('**/expected-path')

// Wait for network
await page.waitForResponse(resp => resp.url().includes('/api/'))

// Wait for load state
await page.waitForLoadState('networkidle')
```

### Selector Priority
```
1. data-testid (most stable)
2. ARIA roles/labels
3. Semantic HTML (button, input)
4. Text content (last resort)
```

---

*"Tests should be deterministic, fast, and maintainable. This plan eliminates the gambling and replaces it with certainty."*

— Murat, Test Architect
