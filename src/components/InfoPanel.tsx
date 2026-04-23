import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function InfoPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Info button — top right */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm
                   border border-black/10 flex items-center justify-center
                   text-black/50 hover:text-black hover:border-black/20
                   transition-all duration-200 cursor-pointer shadow-sm"
        style={{ pointerEvents: 'auto' }}
      >
        <span className="text-sm font-medium">i</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="info-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
              style={{ pointerEvents: 'auto' }}
              onClick={() => setOpen(false)}
            />

            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ pointerEvents: 'none' }}
            >
              <motion.div
                key="info-modal"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl p-8 max-w-md text-black shadow-lg border border-black/5 mx-4"
                style={{ pointerEvents: 'auto' }}
              >
                <div className="flex justify-between items-start mb-5">
                  <h2 className="text-lg font-medium tracking-tight">About</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-black/30 hover:text-black text-lg leading-none transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-sm text-black/60 leading-relaxed">
                  <p>
                    This memorial was made to remind us that these people are not just numbers.
                    Every knot here represents a life lost, each with connections and
                    stories that we will never fully know.
                  </p>

                  <p>
                    It's important to note that the numbers here do not truly reflect
                    the number of lives lost. From{' '}
                    <span className="text-black font-medium italic">The Lancet</span> in
                    2024, a medical and public health journal:
                  </p>

                  <blockquote className="border-l-2 border-black/20 pl-4 italic text-black/50">
                    "It is not implausible to estimate that up to 186,000 or even more
                    deaths could be attributable to the current conflict in Gaza."
                  </blockquote>

                  <p className="font-medium text-black/80">
                    Pray for every life taken by Apartheid Israel and every life in danger because of
                    the Zionist entity. And as always, Free Palestine.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-black/10">
                  <p className="text-xs text-black/35">
                    Data made available by{' '}
                    <a
                      href="https://data.techforpalestine.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black/60 transition-colors"
                    >
                      data.techforpalestine.org
                    </a>
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
