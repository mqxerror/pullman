import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-stone-200/70',
        className
      )}
    />
  )
}

// Pre-built skeleton patterns
export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function UnitCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-full mt-2" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
      <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
    </tr>
  )
}

export function BuildingNavigatorSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex-1 flex gap-4">
        <div className="w-20 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function FeaturedUnitsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function FloorPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <UnitCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
