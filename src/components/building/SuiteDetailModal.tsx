import { motion } from 'framer-motion'
import {
  X,
  Maximize2,
  Building2,
  Download,
  View,
  ChevronRight,
} from 'lucide-react'
import type { ExecutiveSuite } from '@/types/database'
import { projectConfig } from '@/config/project'
import { cn } from '@/lib/utils'

interface SuiteDetailModalProps {
  suite: ExecutiveSuite
  onClose: () => void
}

export default function SuiteDetailModal({
  suite,
  onClose,
}: SuiteDetailModalProps) {
  // Determine which suite image to show based on unit number
  const getSuiteImage = (unitNumber: number): string => {
    // Larger units (7, 8, 9, 11) use type-07 render
    // Others use type-08 render
    if ([7, 8, 9, 11].includes(unitNumber)) {
      return '/assets/gallery/suite-type-07.jpg'
    }
    return '/assets/gallery/suite-type-08.jpg'
  }

  // Get size category
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Image Section */}
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            <img
              src={getSuiteImage(suite.unit_number)}
              alt={`Suite ${suite.floor}-${suite.unit_number}`}
              className="w-full h-full object-cover"
            />

            {/* 360 Tour Button (Coming Soon) */}
            <div className="absolute bottom-4 left-4 right-4">
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-white/70 cursor-not-allowed"
              >
                <View className="w-5 h-5" />
                <span>360° Tour Coming Soon</span>
              </button>
            </div>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
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
            <div className="p-6 border-b border-slate-700">
              <p className="text-amber-400 text-sm font-medium mb-1">
                {getSizeCategory(suite.size_sqm)}
              </p>
              <h2 className="text-2xl font-bold text-white">
                Suite {suite.floor}-{suite.unit_number}
              </h2>
              <p className="text-slate-400 mt-1">
                Floor {suite.floor} • {projectConfig.name}
              </p>
            </div>

            {/* Specs */}
            <div className="p-6 border-b border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-400">Size</span>
                  </div>
                  <p className="text-xl font-bold text-white">
                    {suite.size_sqm} m²
                  </p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-400">Floor</span>
                  </div>
                  <p className="text-xl font-bold text-white">{suite.floor}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-sm text-amber-400/70">Investment Price</p>
                <p className="text-2xl font-bold text-amber-400">
                  {suite.price_display || 'Contact for Pricing'}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                Suite Features
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {projectConfig.amenities.suiteFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Benefits */}
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-sm font-medium text-slate-400 mb-3">
                Investment Benefits
              </h3>
              <div className="space-y-2">
                {projectConfig.investment.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="p-6 mt-auto bg-slate-800/50">
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-xl transition-colors">
                <Download className="w-4 h-4" />
                <span>Download Suite Brochure</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
