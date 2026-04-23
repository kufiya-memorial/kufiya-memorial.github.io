import { AnimatePresence, motion } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'

export function OnboardingPopup() {
  const appState = useMemorialStore((s) => s.appState)
  const setAppState = useMemorialStore((s) => s.setAppState)

  if (appState !== 'ONBOARDING') return null

  return (
    <AnimatePresence>
      <motion.div
        key="onboard"
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
            className="max-w-sm text-center px-6"
          >
            <h2 className="text-2xl font-medium tracking-tight mb-6">
              How to explore
            </h2>

            <div className="space-y-4 text-sm text-black/55 leading-relaxed text-left mb-8">
              <p>Each mark on this kufiya represents a recorded life lost.</p>
              <p>
                <span className="text-black font-medium">Drag</span> to pan across the memorial
              </p>
              <p>
                <span className="text-black font-medium">Scroll or pinch</span> to zoom in and out
              </p>
              <p>
                <span className="text-black font-medium">Click any mark</span> to see who they were
              </p>
              <p>
                <span className="text-black font-medium">Filter</span> by age and sex using the controls in the header
              </p>
            </div>

            <button
              onClick={() => setAppState('STATS')}
              className="px-10 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium
                         rounded-full hover:bg-black/80 transition-all duration-200 cursor-pointer"
            >
              Continue
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
