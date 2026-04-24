import { motion, AnimatePresence } from 'framer-motion'
import { useMemorialStore } from '../store/useMemorialStore'

export function ProfileModal() {
  const activeProfile = useMemorialStore((s) => s.activeProfile)
  const setActiveProfile = useMemorialStore((s) => s.setActiveProfile)

  if (!activeProfile) return <AnimatePresence />

  const enName = activeProfile.en_name?.trim() || ''
  const arName = activeProfile.name?.trim() || ''
  const displayName = enName || arName

  const displayAge =
    activeProfile.age !== null && activeProfile.age !== undefined
      ? String(activeProfile.age)
      : 'Unknown'

  const displaySex =
    activeProfile.sex === 'm'
      ? 'Male'
      : activeProfile.sex === 'f'
        ? 'Female'
        : 'Unspecified'

  // Mercy prayer based on sex
  const mercyArabic =
    activeProfile.sex === 'f' ? 'الله يرحمها' 
    : activeProfile.sex === 'm' ? 'الله يرحمه' 
    : 'الله يرحمهم'
  const mercyEnglish = 
    activeProfile.sex === 'f' ? 'May God have mercy on her' 
    : activeProfile.sex === 'm' ? 'May God have mercy on him'
    : 'May God have mercy on them'

  return (
    <AnimatePresence>
      {activeProfile && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            style={{ pointerEvents: 'auto' }}
            onClick={() => setActiveProfile(null)}
          />

          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl p-8 min-w-[300px] max-w-sm text-black shadow-lg border border-black/5"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Name section */}
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-xl font-medium tracking-tight leading-tight pr-4">
                  {displayName}
                </h2>
                <button
                  onClick={() => setActiveProfile(null)}
                  className="text-black/30 hover:text-black text-lg leading-none transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Arabic name */}
              {arName && enName && (
                <p className="text-xl text-black/50 mb-5" dir="rtl">
                  {arName}
                </p>
              )}
              {!enName && arName && <div className="mb-5" />}

              {/* Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium w-10">
                    Age
                  </span>
                  <span className="text-sm">{displayAge}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-black/40 font-medium w-10">
                    Sex
                  </span>
                  <span className="text-sm">{displaySex}</span>
                </div>
              </div>

              {/* Mercy prayer */}
              <div className="pt-4 border-t border-black/10 text-center">
                <p className="text-base text-black/70 mb-0.5" dir="rtl">
                  {mercyArabic}
                </p>
                <p className="text-xs text-black/40">
                  {mercyEnglish}
                </p>
              </div>

              {/* Future: Narrative/Story Section */}
              <div>{/* Future: Narrative/Story Section */}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
