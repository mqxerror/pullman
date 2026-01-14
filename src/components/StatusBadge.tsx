import { cn } from '@/lib/utils'
import type { ApartmentStatus } from '@/types/database'

interface StatusBadgeProps {
  status: ApartmentStatus
  size?: 'sm' | 'md'
}

const statusConfig = {
  available: { label: 'Available', className: 'bg-status-available' },
  reserved: { label: 'Reserved', className: 'bg-status-reserved' },
  sold: { label: 'Sold', className: 'bg-status-sold' },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full text-white font-medium',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
