import { useMemorialStore } from '../store/useMemorialStore'

export function FilterPanel() {
  const filters = useMemorialStore((s) => s.filters)
  const setFilters = useMemorialStore((s) => s.setFilters)

  return (
    <div
      className="absolute top-5 left-5 p-5 bg-white/90 backdrop-blur-sm border border-black/10 rounded-xl text-black shadow-sm"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="mb-4">
        <label className="block text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-2">
          Age Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={99}
            value={filters.ageRange.min}
            onChange={(e) =>
              setFilters({
                ageRange: {
                  ...filters.ageRange,
                  min: Math.max(0, Number(e.target.value)),
                },
              })
            }
            className="w-16 px-2 py-1.5 border border-black/10 bg-white text-black text-sm rounded-lg focus:outline-none focus:border-black/30 transition-colors"
          />
          <span className="text-xs text-black/30">—</span>
          <input
            type="number"
            min={0}
            max={100}
            value={filters.ageRange.max}
            onChange={(e) =>
              setFilters({
                ageRange: {
                  ...filters.ageRange,
                  max: Math.min(100, Number(e.target.value)),
                },
              })
            }
            className="w-16 px-2 py-1.5 border border-black/10 bg-white text-black text-sm rounded-lg focus:outline-none focus:border-black/30 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-2">
          Sex
        </label>
        <div className="flex gap-1">
          {(['all', 'm', 'f'] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilters({ sex: value })}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                filters.sex === value
                  ? 'bg-black text-white'
                  : 'bg-black/5 text-black/60 hover:bg-black/10'
              }`}
            >
              {value === 'all' ? 'All' : value === 'm' ? 'Male' : 'Female'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
