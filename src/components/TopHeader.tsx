import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'
import { matchesFilter } from '../utils/layout'
import type { GazaSummary } from '../store/useMemorialStore'

function StatRow({ label, value }: { label: string; value: string | number }) {
  const display = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-xs text-black/50">{label}</span>
      <span className="text-xs font-semibold text-black tabular-nums">{display}</span>
    </div>
  )
}

function StatsPanel({ gaza, onClose }: { gaza: GazaSummary; onClose: () => void }) {
  return (
    <>
      <motion.div key="stats-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
        style={{ pointerEvents: 'auto', zIndex: 20 }} onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: 'none', zIndex: 21 }}>
        <motion.div key="stats-modal" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-2xl p-6 w-[540px] max-w-[90vw] text-black shadow-lg border border-black/5 mx-4 max-h-[80vh] overflow-y-auto"
          style={{ pointerEvents: 'auto' }}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-medium tracking-tight">Israel's war on Gaza, in numbers</h2>
            <button onClick={onClose} className="text-black/30 hover:text-black text-lg leading-none transition-colors cursor-pointer">✕</button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Last updated</p>
          <p className="text-xs text-black/60 mb-4">{gaza.last_update}</p>

          <div className="space-y-0.5 mb-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Killed</p>
            <StatRow label="Total killed" value={gaza.killed.total} />
            <StatRow label="Children" value={gaza.killed.children} />
            <StatRow label="Women" value={gaza.killed.women} />
            <StatRow label="Medical workers" value={gaza.killed.medical} />
            <StatRow label="Press" value={gaza.killed.press} />
            <StatRow label="Civil defence" value={gaza.killed.civil_defence} />
          </div>

          <div className="space-y-0.5 mb-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Injured</p>
            <StatRow label="Total injured" value={gaza.injured.total} />
          </div>

          <div className="space-y-0.5 mb-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Famine</p>
            <StatRow label="Deaths from famine" value={gaza.famine.total} />
            <StatRow label="Children" value={gaza.famine.children} />
          </div>

          <div className="space-y-0.5 mb-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Aid seekers</p>
            <StatRow label="Killed" value={gaza.aid_seeker.killed} />
            <StatRow label="Injured" value={gaza.aid_seeker.injured} />
          </div>

          <div className="space-y-0.5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-black/35 font-medium mb-1">Other</p>
            <StatRow label="Massacres" value={gaza.massacres} />
            <StatRow label="Reports filed" value={gaza.reports} />
          </div>
        </motion.div>
      </div>
    </>
  )
}

export function TopHeader() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const filters = useMemorialStore((s) => s.filters)
  const setFilters = useMemorialStore((s) => s.setFilters)
  const gazaSummary = useMemorialStore((s) => s.gazaSummary)
  const totalKilled = useMemorialStore((s) => s.gazaSummary?.killed.total ?? s.rawProfiles.length)
  const rawProfiles = useMemorialStore((s) => s.rawProfiles)

  const isFiltered = filters.sex !== 'all' || filters.ageRange.min > 0 || filters.ageRange.max < 100
  const filteredCount = isFiltered
    ? rawProfiles.filter((p) => matchesFilter(p, filters)).length
    : totalKilled

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm flex flex-col"
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        <div className="flex items-center justify-between px-5 h-14">
          <h1 className="text-base font-semibold tracking-tight text-black">
            Kufiya Memorial
          </h1>
          <div className="flex items-center gap-3">
            {totalKilled > 0 && (
              <span className="text-sm text-black/50 font-medium tabular-nums">
                {isFiltered ? (
                  <>
                    <span className="text-black font-semibold">{filteredCount.toLocaleString()}</span>
                    <span className="text-black/30"> / </span>
                    <span className="text-black font-semibold">{totalKilled.toLocaleString()}</span> martyred
                  </>
                ) : (
                  <>
                    <span className="text-black font-semibold">{totalKilled.toLocaleString()}</span> martyred
                  </>
                )}
              </span>
            )}
            {gazaSummary && (
              <button
                onClick={() => setStatsOpen(true)}
                className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer bg-black/5 text-black/60 hover:bg-black/10"
              >
                Stats
              </button>
            )}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer bg-black/5 text-black/60 hover:bg-black/10"
            >
              Filter
            </button>
            <button
              onClick={() => setInfoOpen(true)}
              className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-black/50 hover:text-black hover:bg-black/10 transition-all duration-200 cursor-pointer"
            >
              <span className="text-sm font-medium">i</span>
            </button>
          </div>
        </div>
        {/* Triple border: thin - thick - thin */}
        <div className="w-full h-[2px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[5px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[2px] bg-black" />
      </div>

      {/* Filter dropdown */}
      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div key="filter-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }} className="fixed inset-0"
              style={{ pointerEvents: 'auto', zIndex: 11 }} onClick={() => setFilterOpen(false)} />
            <motion.div key="filter-panel" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[70px] right-5 p-5 bg-white rounded-xl border border-black/10 shadow-lg"
              style={{ pointerEvents: 'auto', zIndex: 12 }}>
              <div className="mb-4">
                <label className="block text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-2">Age Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={100} value={filters.ageRange.min}
                    onChange={(e) => setFilters({ ageRange: { ...filters.ageRange, min: Math.max(0, Number(e.target.value)) } })}
                    className="w-16 px-2 py-1.5 border border-black/10 bg-white text-black text-sm rounded-lg focus:outline-none focus:border-black/30" />
                  <span className="text-xs text-black/30">—</span>
                  <input type="number" min={0} max={100} value={filters.ageRange.max}
                    onChange={(e) => setFilters({ ageRange: { ...filters.ageRange, max: Math.min(100, Number(e.target.value)) } })}
                    className="w-16 px-2 py-1.5 border border-black/10 bg-white text-black text-sm rounded-lg focus:outline-none focus:border-black/30" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium mb-2">Sex</label>
                <div className="flex gap-1">
                  {(['all', 'm', 'f', 'unknown'] as const).map((v) => (
                    <button key={v} onClick={() => setFilters({ sex: v })}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${filters.sex === v ? 'bg-black text-white' : 'bg-black/5 text-black/60 hover:bg-black/10'}`}>
                      {v === 'all' ? 'All' : v === 'm' ? 'Male' : v === 'f' ? 'Female' : 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats modal */}
      <AnimatePresence>
        {statsOpen && gazaSummary && <StatsPanel gaza={gazaSummary} onClose={() => setStatsOpen(false)} />}
      </AnimatePresence>

      {/* Info modal */}
      <AnimatePresence>
        {infoOpen && (
          <>
            <motion.div key="info-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
              style={{ pointerEvents: 'auto', zIndex: 20 }} onClick={() => setInfoOpen(false)} />
            <div className="fixed inset-0 flex items-center justify-center" style={{ pointerEvents: 'none', zIndex: 21 }}>
              <motion.div key="info-modal" initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-8 max-w-md text-black shadow-lg border border-black/5 mx-4"
                style={{ pointerEvents: 'auto' }}>
                <div className="flex justify-between items-start mb-5">
                  <h2 className="text-lg font-medium tracking-tight">About</h2>
                  <button onClick={() => setInfoOpen(false)} className="text-black/30 hover:text-black text-lg leading-none transition-colors cursor-pointer">✕</button>
                </div>
                <div className="space-y-4 text-sm text-black/60 leading-relaxed">
                  <p>This memorial was made to remind us that the people Apartheid Israel killed are not just numbers. Every knot here represents a life lost, each with connections and stories that we will never fully know.</p>
                  <p>It's important to note that the numbers here do not truly reflect the number of lives taken. From <span className="text-black font-medium italic">The Lancet</span> in 2024, a medical and public health journal:</p>
                  <blockquote className="border-l-2 border-black/20 pl-4 italic text-black/50">"It is not implausible to estimate that up to 186,000 or even more deaths could be attributable to the current conflict in Gaza."</blockquote>
                  <p className="font-medium text-black/80">Pray for every life taken and every life in danger of it by the Zionist entity.</p>
                  <p>And as always, Free Palestine.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-black/10">
                  <p className="text-xs text-black/35">Data made available by{' '}
                    <a href="https://data.techforpalestine.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black/60 transition-colors">data.techforpalestine.org</a>
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
