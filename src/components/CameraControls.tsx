import { useEffect, useRef } from 'react'
import { MapControls as MapControlsImpl } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { TOUCH, Vector3, MathUtils } from 'three'
import { useMemorialStore } from '../store/useMemorialStore'
import { computeLayout, HEADER_PX, BORDER_PX } from '../utils/layout'
import { SPACING } from './LatticeMesh'

interface Props {
  visible: boolean
}

export function CameraControls({ visible }: Props) {
  const controlsRef = useRef<any>(null)
  const { camera, size } = useThree()
  const rawProfiles = useMemorialStore((s) => s.rawProfiles)
  const setZoomComplete = useMemorialStore((s) => s.setZoomComplete)
  const count = rawProfiles.length
  const hasSetup = useRef(false)
  const animState = useRef<'idle' | 'waiting' | 'zooming' | 'done'>('idle')
  const waitStart = useRef(0)
  const maxZRef = useRef(500)
  const targetZRef = useRef(0)
  const boundsRef = useRef({ minX: 0, maxX: 0, minY: 0, maxY: 0 })

  const aspect = size.width / size.height

  useEffect(() => {
    if (count === 0 || hasSetup.current) return

    const { cols, rows } = computeLayout(count, SPACING, size.width, size.height)
    const ySpacing = SPACING / 2
    const latticeW = cols * SPACING
    const latticeH = rows * ySpacing
    const cx = latticeW / 2
    const cy = latticeH / 2

    const cam = camera as any
    const fovRad = (cam.fov * Math.PI) / 180
    const halfTan = Math.tan(fovRad / 2)

    const availH = size.height - HEADER_PX - BORDER_PX
    const availFrac = availH / size.height

    const zH = latticeH / (2 * halfTan * availFrac)
    const zW = latticeW / (2 * halfTan * aspect)
    const fullZ = Math.min(zW, zH)

    const totalVisH = 2 * fullZ * halfTan
    const yOffset = ((HEADER_PX - BORDER_PX) / 2 / size.height) * totalVisH

    // Start very zoomed in — pips clearly visible, feels like a real kufiya
    const startZ = fullZ * 0.15
    camera.position.set(cx, cy - yOffset, startZ)

    targetZRef.current = fullZ
    maxZRef.current = fullZ
    boundsRef.current = { minX: 0, maxX: latticeW, minY: 0, maxY: latticeH }

    if (controlsRef.current) {
      controlsRef.current.target.set(cx, cy - yOffset, 0)
      controlsRef.current.maxDistance = fullZ
      controlsRef.current.update()
    }

    hasSetup.current = true
  }, [count, camera, size, aspect])

  useEffect(() => {
    if (visible && hasSetup.current && animState.current === 'idle') {
      animState.current = 'waiting'
      waitStart.current = performance.now()
    }
  }, [visible])

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls || !hasSetup.current) return

    // Wait 2s at zoomed-in view
    if (animState.current === 'waiting') {
      if (performance.now() - waitStart.current > 2000) {
        animState.current = 'zooming'
      }
    }

    // Slow zoom out
    if (animState.current === 'zooming') {
      const z = camera.position.z
      const target = targetZRef.current
      if (z < target - 0.3) {
        camera.position.z = MathUtils.lerp(z, target, 0.008)
      } else {
        camera.position.z = target
        animState.current = 'done'
        setZoomComplete(true)
      }
      controls.update()
    }

    // Pan clamping
    const b = boundsRef.current
    const t = controls.target as Vector3
    const cam = camera as any
    const z = camera.position.z
    const fovRad = (cam.fov * Math.PI) / 180
    const visH = 2 * z * Math.tan(fovRad / 2)
    const visW = visH * aspect
    const hw = visW / 2
    const hh = visH / 2
    const lw = b.maxX - b.minX
    const lh = b.maxY - b.minY

    t.x = lw <= visW ? (b.minX + b.maxX) / 2 : Math.max(b.minX + hw, Math.min(b.maxX - hw, t.x))
    t.y = lh <= visH ? (b.minY + b.maxY) / 2 : Math.max(b.minY + hh, Math.min(b.maxY - hh, t.y))

    camera.position.x = t.x
    camera.position.y = t.y
  })

  return (
    <MapControlsImpl
      ref={controlsRef}
      enableRotate={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      enableDamping
      dampingFactor={0.12}
      touches={{ ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }}
      screenSpacePanning
      minDistance={0.5}
      maxDistance={maxZRef.current}
    />
  )
}
