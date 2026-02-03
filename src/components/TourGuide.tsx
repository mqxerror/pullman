/**
 * TourGuide - Website walkthrough using Driver.js
 *
 * Provides guided tours for different pages:
 * - Apartments page: showcases filters and listings
 * - Building Wizard: floor selection and unit details
 */

import { useEffect, useCallback } from 'react'
import { driver, DriveStep } from 'driver.js'
import 'driver.js/dist/driver.css'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Custom styles for Driver.js - Light theme to match the website
const driverStyles = `
  .driver-popover {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  }
  .driver-popover-title {
    color: #0f172a;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }
  .driver-popover-description {
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
  }
  .driver-popover-progress-text {
    color: #94a3b8;
    font-size: 12px;
  }
  .driver-popover-prev-btn,
  .driver-popover-next-btn {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    padding: 8px 16px;
    transition: all 0.2s;
  }
  .driver-popover-prev-btn:hover,
  .driver-popover-next-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
  }
  .driver-popover-prev-btn {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  .driver-popover-prev-btn:hover {
    background: #e2e8f0;
    box-shadow: none;
  }
  .driver-popover-close-btn {
    color: #94a3b8;
  }
  .driver-popover-close-btn:hover {
    color: #f59e0b;
  }
  .driver-popover-arrow-side-left.driver-popover-arrow,
  .driver-popover-arrow-side-right.driver-popover-arrow,
  .driver-popover-arrow-side-top.driver-popover-arrow,
  .driver-popover-arrow-side-bottom.driver-popover-arrow {
    border-color: transparent;
  }
  .driver-overlay {
    background: rgba(0, 0, 0, 0.5);
  }
  .driver-active-element {
    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.5), 0 0 30px rgba(251, 191, 36, 0.3);
    border-radius: 8px;
  }
`

// Tour definitions for different pages
export const TOUR_STEPS: Record<string, DriveStep[]> = {
  apartments: [
    {
      popover: {
        title: 'Welcome to Pullman Apartments',
        description: 'Let us show you how to find your perfect investment unit. This tour will guide you through our search and filtering tools.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="filters"]',
      popover: {
        title: 'Smart Filters',
        description: 'Use these filters to narrow down your search. Filter by floor level, suite type, size, price range, and availability status.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="sort"]',
      popover: {
        title: 'Sort Results',
        description: 'Sort apartments by price (low to high or high to low), size, or floor level to find exactly what you\'re looking for.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="apartment-card"]',
      popover: {
        title: 'Apartment Cards',
        description: 'Each card shows key details: suite type, size, floor, price, and availability. Click any card to see full details.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="view-details"]',
      popover: {
        title: 'View Full Details',
        description: 'Click here to see complete apartment information including floor plans, amenities, and investment calculator.',
        side: 'top',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'Ready to Explore!',
        description: 'You\'re all set! Use the Interactive Map for a visual building exploration, or browse apartments here. Happy investing!',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
  buildingWizard: [
    {
      popover: {
        title: 'Interactive Building Explorer',
        description: 'Welcome! This tool lets you visually explore the building floor by floor. Let\'s walk through how it works.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '[data-tour="building-image"]',
      popover: {
        title: 'Select a Floor',
        description: 'Click on any floor of the building to select it. The highlighted band shows your currently selected floor. Floors 17-27 are available for investment.',
        side: 'right',
        align: 'center',
      },
    },
    {
      element: '[data-tour="floor-navigator"]',
      popover: {
        title: 'Floor Navigator',
        description: 'Use these controls to move between floors. You can also see quick stats about available units on each floor.',
        side: 'left',
        align: 'center',
      },
    },
    {
      element: '[data-tour="floor-stats"]',
      popover: {
        title: 'Floor Statistics',
        description: 'See at a glance how many units are available, reserved, or sold on the selected floor.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="floor-plan"]',
      popover: {
        title: 'Interactive Floor Plan',
        description: 'Click any unit on the floor plan to view its details. Colors indicate availability: green = available, amber = reserved, red = sold.',
        side: 'left',
        align: 'center',
      },
    },
    {
      popover: {
        title: 'You\'re Ready!',
        description: 'Now you know how to navigate the building! Select a floor, then click a unit to see details and pricing.',
        side: 'bottom',
        align: 'center',
      },
    },
  ],
}

interface TourGuideProps {
  tourId: keyof typeof TOUR_STEPS
  className?: string
  buttonText?: string
  variant?: 'button' | 'icon' | 'text'
}

export default function TourGuide({
  tourId,
  className,
  buttonText = 'Take a Tour',
  variant = 'button'
}: TourGuideProps) {
  // Inject custom styles
  useEffect(() => {
    const styleId = 'driver-custom-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = driverStyles
      document.head.appendChild(style)
    }
  }, [])

  const startTour = useCallback(() => {
    const steps = TOUR_STEPS[tourId]
    if (!steps) return

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayClickBehavior: 'close',
      stagePadding: 10,
      stageRadius: 8,
      popoverOffset: 15,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done ✓',
      steps: steps,
    })

    driverObj.drive()
  }, [tourId])

  if (variant === 'icon') {
    return (
      <button
        onClick={startTour}
        className={cn(
          'p-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 transition-all',
          'hover:scale-105 active:scale-95',
          className
        )}
        title="Take a tour"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    )
  }

  if (variant === 'text') {
    return (
      <button
        onClick={startTour}
        className={cn(
          'text-sm text-amber-600 hover:text-amber-700 font-medium underline-offset-4 hover:underline transition-colors',
          className
        )}
      >
        {buttonText}
      </button>
    )
  }

  return (
    <button
      onClick={startTour}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl',
        'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
        'text-white font-medium text-sm shadow-lg shadow-amber-500/25',
        'transition-all hover:scale-[1.02] active:scale-[0.98]',
        className
      )}
    >
      <HelpCircle className="w-4 h-4" />
      {buttonText}
    </button>
  )
}
