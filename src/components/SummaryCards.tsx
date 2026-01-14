import { cn } from '@/lib/utils'
import type { ApartmentStatus } from '@/types/database'

interface SummaryCardsProps {
  counts: {
    available: number
    reserved: number
    sold: number
  }
  activeFilter: ApartmentStatus | 'all'
  onFilterClick: (status: ApartmentStatus | 'all') => void
}

export default function SummaryCards({ counts, activeFilter, onFilterClick }: SummaryCardsProps) {
  const total = counts.available + counts.reserved + counts.sold

  const cards = [
    { label: 'Total', value: total, status: 'all' as const, color: 'bg-primary' },
    { label: 'Available', value: counts.available, status: 'available' as const, color: 'bg-emerald-500' },
    { label: 'Reserved', value: counts.reserved, status: 'reserved' as const, color: 'bg-amber-500' },
    { label: 'Sold', value: counts.sold, status: 'sold' as const, color: 'bg-slate-500' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => onFilterClick(card.status)}
          className={cn(
            'p-4 rounded-lg text-white transition-all',
            card.color,
            activeFilter === card.status
              ? 'ring-4 ring-primary/30 scale-105'
              : 'opacity-80 hover:opacity-100'
          )}
        >
          <div className="text-3xl font-bold">{card.value}</div>
          <div className="text-sm opacity-90">{card.label}</div>
        </button>
      ))}
    </div>
  )
}
