interface PriceTierBarProps {
  price: number
  min?: number
  max?: number
}

export const PriceTierBar = ({ price, min = 306653, max = 492319 }: PriceTierBarProps) => {
  const percentage = Math.min(100, Math.max(0, ((price - min) / (max - min)) * 100))

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>$307K</span>
        <span>$492K</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default PriceTierBar
