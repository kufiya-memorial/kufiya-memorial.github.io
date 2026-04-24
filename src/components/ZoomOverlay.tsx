import { motion, AnimatePresence } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'

/**
 * Shows "Every knot was a life." during the zoom-out animation.
 * Blocks interaction until zoom completes, then fades out.
 */
export function ZoomOverlay() {
  const appState = useMemorialStore((s) => s.appState)
  const zoomComplete = useMemorialStore((s) => s.zoomComplete)

  const show = appState === 'EXPLORING' && !zoomComplete

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="zoom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center bg-transparent"
          style={{ pointerEvents: 'auto', zIndex: 8, touchAction: 'none' }}
          onTouchStart={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl font-light tracking-wide text-black/70 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-2xl"
          >
            Every knot was a life.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
