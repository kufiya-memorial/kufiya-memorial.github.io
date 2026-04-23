import { useMemorialStore } from '../store/useMemorialStore'

export function DeathCounter() {
  const count = useMemorialStore((s) => s.gazaSummary?.killed.total ?? s.rawProfiles.length)

  if (count === 0) return null

  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm
                 border border-black/10 rounded-full px-8 py-3 shadow-md"
      style={{ pointerEvents: 'none', zIndex: 3 }}
    >
      <p className="text-sm text-black/60 font-medium tracking-wide whitespace-nowrap">
        <span className="text-black text-lg font-semibold">{count.toLocaleString()}</span>
        {' '}recorded lives taken
      </p>
    </div>
  )
}
