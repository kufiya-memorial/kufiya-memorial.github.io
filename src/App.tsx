import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useMemorialStore } from './store/useMemorialStore'
import { LandingPage } from './components/LandingPage'
import { OnboardingPopup } from './components/OnboardingPopup'
import { StatsPopup } from './components/StatsPopup'
import { LatticeMesh } from './components/LatticeMesh'
import { LatticeLines } from './components/LatticeLines'
import { CameraControls } from './components/CameraControls'
import { TopHeader } from './components/TopHeader'
import { ProfileModal } from './components/ProfileModal'
import { BorderOverlay } from './components/BorderOverlay'
import { PageChrome } from './components/PageChrome'

function App() {
  const fetchProfiles = useMemorialStore((s) => s.fetchProfiles)
  const appState = useMemorialStore((s) => s.appState)
  const dataReady = useMemorialStore((s) => s.rawProfiles.length > 0)
  const [hasExplored, setHasExplored] = useState(false)

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  useEffect(() => {
    if (appState === 'EXPLORING') setHasExplored(true)
  }, [appState])

  const isPreExploring = appState !== 'EXPLORING'

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-white" style={{ zIndex: 0 }} />

      {/*
        Canvas: mount as soon as data is ready (even during landing/onboarding/stats).
        Hidden with opacity 0 until EXPLORING, so Three.js pre-renders everything.
        When EXPLORING starts, it's already built — just fade in.
      */}
      {dataReady && (
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{
            zIndex: 1,
            opacity: hasExplored ? 1 : 0,
            pointerEvents: hasExplored ? 'auto' : 'none',
          }}
        >
          <Canvas camera={{ near: 0.1, far: 2000, fov: 75 }}>
            <LatticeMesh />
            <LatticeLines />
            <CameraControls visible={hasExplored} />
          </Canvas>
        </div>
      )}

      {/* Exploring UI */}
      {hasExplored && (
        <>
          <BorderOverlay />
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
            <TopHeader />
            <ProfileModal />
          </div>
        </>
      )}

      {/* Pre-exploring chrome */}
      {isPreExploring && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
          <PageChrome />
        </div>
      )}

      {/* Overlay screens */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
        <LandingPage />
        <OnboardingPopup />
        <StatsPopup />
      </div>
    </div>
  )
}

export default App
