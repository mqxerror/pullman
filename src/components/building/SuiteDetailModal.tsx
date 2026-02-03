import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Maximize2,
  Building2,
  Download,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import type { ExecutiveSuite } from '@/types/database'
import { projectConfig } from '@/config/project'
import { cn } from '@/lib/utils'
import { SUITE_PRICES, formatPriceUSD } from '@/config/suiteData'

interface SuiteDetailModalProps {
  suite: ExecutiveSuite
  onClose: () => void
}

export default function SuiteDetailModal({
  suite,
  onClose,
}: SuiteDetailModalProps) {
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [benefitsOpen, setBenefitsOpen] = useState(false)

  const getSuiteImage = (unitNumber: number): string => {
    if ([7, 8, 9, 11].includes(unitNumber)) {
      return '/assets/gallery/suite-type-07.jpg'
    }
    return '/assets/gallery/suite-type-08.jpg'
  }

  const getSizeCategory = (sizeSqm: number): string => {
    if (sizeSqm >= 80) return 'Premium Suite'
    if (sizeSqm >= 65) return 'Deluxe Suite'
    return 'Executive Suite'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 1 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full bg-slate-900 overflow-hidden shadow-2xl',
          // Mobile: bottom sheet
          'rounded-t-2xl max-h-[92vh]',
          // Desktop: centered modal
          'md:rounded-2xl md:max-w-4xl md:max-h-[90vh]'
        )}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-600" />
        </div>

        {/* Close Button - 44px touch target */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[92vh] md:max-h-[90vh]">
          {/* Image Section - shorter on mobile */}
          <div className="relative lg:w-1/2 h-40 md:h-64 lg:h-auto flex-shrink-0">
            <img
              src={getSuiteImage(suite.unit_number)}
              alt={`Suite ${suite.floor}-${suite.unit_number}`}
              className="w-full h-full object-cover"
            />

            {/* Status Badge */}
            <div className="absolute top-3 left-3 md:top-4 md:left-4">
              <span
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  suite.status === 'available' &&
                    'bg-emerald-500 text-white',
                  suite.status === 'reserved' &&
                    'bg-amber-500 text-slate-900',
                  suite.status === 'sold' && 'bg-slate-500 text-white'
                )}
              >
                {suite.status.charAt(0).toUpperCase() + suite.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:w-1/2 flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-slate-700">
              <p className="text-amber-400 text-sm font-medium mb-1">
                {getSizeCategory(suite.size_sqm)}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Suite {suite.floor}-{suite.unit_number}
              </h2>
              <p className="text-slate-400 mt-1">
                Floor {suite.floor} &bull; {projectConfig.name}
              </p>
            </div>

            {/* Specs */}
            <div className="p-4 md:p-6 border-b border-slate-700">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-800 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    <span className="text-base text-slate-400">Size</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-white">
                    {suite.size_sqm} m&sup2;
                  </p>
                </div>
                <div className="bg-slate-800 rounded-xl p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="text-base text-slate-400">Floor</span>
                  </div>
                  <p className="text-lg md:text-xl font-bold text-white">{suite.floor}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-3 md:mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 md:p-4">
                <p className="text-base text-amber-400/70">Investment Price</p>
                <p className="text-xl md:text-2xl font-bold text-amber-400">
                  {suite.price_display || formatPriceUSD(SUITE_PRICES[suite.unit_number])}
                </p>
              </div>
            </div>

            {/* Features - collapsible on mobile */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className="w-full flex items-center justify-between p-4 md:p-6 md:cursor-default"
              >
                <h3 className="text-base font-medium text-slate-400">
                  Suite Features
                </h3>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 md:hidden transition-transform',
                  featuresOpen && 'rotate-180'
                )} />
              </button>
              <div className={cn(
                'px-4 pb-4 md:px-6 md:pb-6 grid grid-cols-2 gap-2',
                !featuresOpen && 'hidden md:grid'
              )}>
                {projectConfig.amenities.suiteFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-base text-white/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Benefits - collapsible on mobile */}
            <div className="border-b border-slate-700">
              <button
                onClick={() => setBenefitsOpen(!benefitsOpen)}
                className="w-full flex items-center justify-between p-4 md:p-6 md:cursor-default"
              >
                <h3 className="text-base font-medium text-slate-400">
                  Investment Benefits
                </h3>
                <ChevronDown className={cn(
                  'w-4 h-4 text-slate-400 md:hidden transition-transform',
                  benefitsOpen && 'rotate-180'
                )} />
              </button>
              <div className={cn(
                'px-4 pb-4 md:px-6 md:pb-6 space-y-2',
                !benefitsOpen && 'hidden md:block'
              )}>
                {projectConfig.investment.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-base text-white/80"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 md:p-6 mt-auto bg-slate-800/50">
              <a
                href="/assets/Pullman-Technical-Layouts-Brochure.pdf"
                download="Pullman-Technical-Layouts-Brochure.pdf"
                className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Suite Brochure</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
