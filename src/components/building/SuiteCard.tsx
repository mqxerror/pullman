import { cn } from '@/lib/utils'
import type { ExecutiveSuite } from '@/types/database'
import { Check, Clock, Lock, Maximize2, ArrowRight } from 'lucide-react'
import { SUITE_PRICES, formatPriceShort } from '@/config/suiteData'

interface SuiteCardProps {
  suite: ExecutiveSuite
  onClick: () => void
}

// Get suite type based on size
const getSuiteType = (sizeSqm: number): string => {
  if (sizeSqm >= 80) return 'Premium Suite'
  if (sizeSqm >= 65) return 'Deluxe Suite'
  return 'Executive Suite'
}

// Get price from config (with fallback to DB price)
const getSuitePrice = (suite: ExecutiveSuite): string => {
  const price = suite.price_usd || SUITE_PRICES[suite.unit_number]
  return price ? formatPriceShort(price) : 'Contact'
}


// Status configuration
const statusConfig = {
  available: {
    icon: Check,
    label: 'Available',
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    ctaClass: 'bg-slate-900 text-white hover:bg-slate-800',
    cardClass: '',
    contentClass: '',
  },
  reserved: {
    icon: Clock,
    label: 'Reserved',
    badgeClass: 'bg-amber-50 text-amber-600 border border-amber-200',
    ctaClass: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50',
    cardClass: '',
    contentClass: '',
  },
  sold: {
    icon: Lock,
    label: 'Sold',
    badgeClass: 'bg-slate-100 text-slate-500 border border-slate-200',
    ctaClass: 'bg-transparent border border-slate-200 text-slate-400 hover:bg-slate-50',
    cardClass: 'bg-slate-50/50',
    contentClass: 'opacity-60',
  },
}

export default function SuiteCard({ suite, onClick }: SuiteCardProps) {
  const config = statusConfig[suite.status]
  const suiteType = getSuiteType(suite.size_sqm)
  const price = suite.price_display || getSuitePrice(suite)
  const StatusIcon = config.icon
  const isSold = suite.status === 'sold'

  return (
    <button
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-4 text-left w-full group relative',
        'border border-slate-200 hover:border-slate-300 hover:shadow-md',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2',
        config.cardClass
      )}
    >
      {/* Status Badge */}
      <div className={cn(
        'absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
        config.badgeClass
      )}>
        <StatusIcon className="w-3 h-3" />
        <span>{config.label}</span>
      </div>

      {/* Content */}
      <div className={config.contentClass}>
        {/* Unit Header */}
        <div className="pr-20 mb-3">
          <h3 className="text-lg text-slate-900 font-semibold">
            {suite.floor}-{suite.unit_number}
          </h3>
          <p className="text-sm text-slate-500">
            {suiteType}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-[11px] text-slate-400 uppercase tracking-wide">
            {isSold ? 'Sold at' : 'From'}
          </span>
          <div className="text-xl text-slate-900 font-bold">{price}</div>
        </div>

        {/* Attributes Row */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          {/* Size */}
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-slate-400" />
            <span>{suite.size_sqm} m²</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className={cn(
        'flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
        config.ctaClass
      )}>
        <span>View Details</span>
        {isSold && <span className="text-xs opacity-60">· Reference</span>}
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  )
}
