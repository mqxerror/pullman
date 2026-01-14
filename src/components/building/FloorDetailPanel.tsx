import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Maximize2, Check, Clock, Lock, Grid3X3, LayoutGrid } from 'lucide-react'
import type { ExecutiveSuite } from '@/types/database'
import { cn } from '@/lib/utils'
import FloorPlanInteractive from './FloorPlanInteractive'

interface FloorDetailPanelProps {
  floor: number
  suites: ExecutiveSuite[]
  onSuiteClick: (suite: ExecutiveSuite) => void
  onBack: () => void
}

export default function FloorDetailPanel({
  floor,
  suites,
  onSuiteClick,
  onBack,
}: FloorDetailPanelProps) {
  const [viewMode, setViewMode] = useState<'plan' | 'grid'>('plan')
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>()

  // Handle suite click from floor plan
  const handleSuiteClick = (suite: ExecutiveSuite) => {
    setSelectedUnitId(suite.id)
    onSuiteClick(suite)
  }

  // Calculate stats
  const stats = {
    total: suites.length,
    available: suites.filter((s) => s.status === 'available').length,
    reserved: suites.filter((s) => s.status === 'reserved').length,
    sold: suites.filter((s) => s.status === 'sold').length,
  }

  // Get status icon and color
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: Check,
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500',
        }
      case 'reserved':
        return {
          icon: Clock,
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500',
        }
      case 'sold':
        return {
          icon: Lock,
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          badge: 'bg-slate-500',
        }
      default:
        return {
          icon: Check,
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/30',
          text: 'text-slate-400',
          badge: 'bg-slate-500',
        }
    }
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute top-0 right-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-slate-900/95 backdrop-blur-lg border-l border-slate-700 z-20 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Floor {floor}</h2>
            <p className="text-sm text-slate-400">Executive Suites</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-400">{stats.available}</p>
            <p className="text-xs text-emerald-400/70">Available</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-amber-400">{stats.reserved}</p>
            <p className="text-xs text-amber-400/70">Reserved</p>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-slate-400">{stats.sold}</p>
            <p className="text-xs text-slate-500">Sold</p>
          </div>
        </div>
      </div>

      {/* View Toggle & Floor Plan */}
      <div className="p-4 border-b border-slate-700">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-400">
            {viewMode === 'plan' ? 'Interactive Floor Plan' : 'All Units'}
          </h3>
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('plan')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'plan'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              )}
              title="Floor Plan View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-400 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Floor Plan */}
        {viewMode === 'plan' && (
          <FloorPlanInteractive
            floor={floor}
            suites={suites}
            onSuiteClick={handleSuiteClick}
            selectedUnitId={selectedUnitId}
          />
        )}
      </div>

      {/* Units Grid (shown in grid mode or always below plan) */}
      <div className={cn('p-4', viewMode === 'plan' && 'border-t border-slate-700')}>
        <h3 className="text-sm font-medium text-slate-400 mb-3">
          {viewMode === 'plan' ? 'Quick Select' : 'All Units on Floor ' + floor}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {suites.map((suite) => {
            const styles = getStatusStyles(suite.status)
            const Icon = styles.icon

            return (
              <motion.button
                key={suite.id}
                onClick={() => suite.status !== 'sold' && handleSuiteClick(suite)}
                disabled={suite.status === 'sold'}
                whileHover={suite.status !== 'sold' ? { scale: 1.02 } : {}}
                whileTap={suite.status !== 'sold' ? { scale: 0.98 } : {}}
                className={cn(
                  'relative p-4 rounded-xl border transition-all text-left',
                  styles.bg,
                  styles.border,
                  suite.status === 'sold'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-white/30 cursor-pointer'
                )}
              >
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <div className={cn('w-2 h-2 rounded-full', styles.badge)} />
                </div>

                {/* Unit Info */}
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg', styles.bg)}>
                    <Icon className={cn('w-4 h-4', styles.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold">
                      Suite {suite.unit_number}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Maximize2 className="w-3 h-3 text-slate-400" />
                      <span className="text-sm text-slate-400">
                        {suite.size_sqm} m²
                      </span>
                    </div>
                    <p className={cn('text-xs mt-2 capitalize', styles.text)}>
                      {suite.status}
                    </p>
                  </div>
                </div>

                {/* Price */}
                {suite.status === 'available' && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="text-sm text-white font-medium">
                      {suite.price_display || 'Contact for pricing'}
                    </p>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="sticky bottom-0 p-4 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700">
        <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-xl transition-colors">
          Contact Sales for Floor {floor}
        </button>
      </div>
    </motion.div>
  )
}
