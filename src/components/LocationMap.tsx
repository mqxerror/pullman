import { cn } from '@/lib/utils'

interface LocationMapProps {
  className?: string
}

export default function LocationMap({ className }: LocationMapProps) {
  return (
    <div className={cn('relative w-full h-full', className)}>
      <img
        src="/assets/maps/panama-location-map.jpg"
        alt="Panama City map showing landmarks, airport, and driving distances"
        className="w-full h-full object-cover object-top"
      />
    </div>
  )
}
