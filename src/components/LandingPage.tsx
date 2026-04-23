import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'

export function LandingPage() {
  const appState = useMemorialStore((s) => s.appState)
  const setAppState = useMemorialStore((s) => s.setAppState)
  const isLoading = useMemorialStore((s) => s.isLoading)
  const [clicked, setClicked] = useState(false)

  if (appState !== 'LANDING') return null

  const handleEnter = () => {
    if (isLoading) {
      setClicked(true)
      const unsub = useMemorialStore.subscribe((state) => {
        if (!state.isLoading) {
          unsub()
          setAppState('ONBOARDING')
        }
      })
    } else {
      setAppState('ONBOARDING')
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        key="landing"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-white pointer-events-auto"
        style={{ zIndex: 10 }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={handleEnter}
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-black mb-4"
          >
            Kufiya Memorial
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-lg text-black/50 mb-10 max-w-md text-center leading-relaxed font-light"
          >
            In honour of every life taken since 7 October 2023.
          </motion.p>

          {clicked && isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <p className="text-xs text-black/30">Loading data…</p>
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-xs text-black/30 uppercase tracking-[0.2em]"
            >
              Click to enter
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
