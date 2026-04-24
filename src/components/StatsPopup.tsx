import { AnimatePresence, motion } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'

const PIP_WIDTH_CM = 3.5
const ROW_HEIGHT_CM = PIP_WIDTH_CM / 2
const HOURS_PER_KUFIYA = 1

function computeKufiyaStats(count: number) {
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const widthCm = cols * PIP_WIDTH_CM
  const heightCm = rows * ROW_HEIGHT_CM
  const areaSqM = (widthCm * heightCm) / 10000
  const totalHours = count * HOURS_PER_KUFIYA
  const totalDays = Math.ceil(totalHours / 24)
  const totalYears = (totalDays / 365).toFixed(1)
  return { areaSqM, totalDays, totalYears }
}

export function StatsPopup() {
  const appState = useMemorialStore((s) => s.appState)
  const setAppState = useMemorialStore((s) => s.setAppState)
  const count = useMemorialStore((s) => s.gazaSummary?.killed.total ?? s.rawProfiles.length)

  if (appState !== 'STATS' || count === 0) return null

  const stats = computeKufiyaStats(count)

  return (
    <AnimatePresence>
      <motion.div
        key="stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-white"
        style={{ pointerEvents: 'auto', zIndex: 10 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-center px-6"
          >
            <p className="text-4xl font-semibold tracking-tight mb-2">
              {count.toLocaleString()}
            </p>
            <p className="text-sm text-black/50 mb-8">
              recorded lives taken in Gaza
            </p>

            <div className="space-y-5 text-sm text-black/60 leading-relaxed text-left mb-8">
              <p>
                <span className="text-black font-medium">Hirbawi</span>, the last authentic
                Palestinian kufiya factory in Palestine, takes one hour to weave a single kufiya.
                If Hirbawi made one kufiya for every life taken and worked 24 hours a day, it would take{' '}
                <span className="text-black font-medium">
                  {stats.totalDays.toLocaleString()} days
                </span>{' '}
                ({stats.totalYears} years) to make them all.
              </p>
            </div>

            <button
              onClick={() => setAppState('EXPLORING')}
              className="px-10 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium
                         rounded-full hover:bg-black/80 transition-all duration-200 cursor-pointer"
            >
              Enter the Memorial
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
