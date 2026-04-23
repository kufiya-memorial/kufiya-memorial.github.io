import { useRef, useMemo, useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { useMemorialStore } from '../store/useMemorialStore'
import { computeLayout, matchesFilter } from '../utils/layout'
import {
  InstancedMesh as InstancedMeshType,
  Color,
  Object3D,
  ShapeGeometry,
  Shape,
  MeshBasicMaterial,
  DoubleSide,
} from 'three'
import type { ThreeEvent } from '@react-three/fiber'

export const SPACING = 1.0

const PIP_RX = SPACING * 0.12
const PIP_RY = SPACING * 0.20

const BLACK = new Color('#000000')
const GREY = new Color('#DDDDDD')
const TRANSPARENT = new Color('#FFFFFF')
const HOVER_MATCH = new Color('#444444')
const HOVER_NON_MATCH = new Color('#EEEEEE')

const tempObject = new Object3D()
const tempColor = new Color()

function makeEllipse(rx: number, ry: number): ShapeGeometry {
  const shape = new Shape()
  const segs = 24
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2
    const x = Math.cos(a) * rx
    const y = Math.sin(a) * ry
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  return new ShapeGeometry(shape)
}

export function LatticeMesh() {
  const meshRef = useRef<InstancedMeshType>(null)
  const hoveredRef = useRef<number | null>(null)
  const prevColorRef = useRef<Color | null>(null)
  const { size } = useThree()

  const rawProfiles = useMemorialStore((s) => s.rawProfiles)
  const filters = useMemorialStore((s) => s.filters)
  const setActiveProfile = useMemorialStore((s) => s.setActiveProfile)

  const count = rawProfiles.length

  const layoutResult = useMemo(
    () => computeLayout(count, SPACING, size.width, size.height),
    [count, size.width, size.height],
  )

  const { transforms } = layoutResult
  const totalSlots = transforms.length

  // Precompute slot→profileIndex mapping (O(n) once, instead of O(n) per lookup)
  const slotToProfile = useMemo(() => {
    const map = new Int32Array(totalSlots)
    let realIdx = 0
    for (let i = 0; i < totalSlots; i++) {
      if (transforms[i].isGhost) {
        map[i] = -1
      } else {
        map[i] = realIdx++
      }
    }
    return map
  }, [transforms, totalSlots])

  const geometry = useMemo(() => makeEllipse(PIP_RX, PIP_RY), [])
  const material = useMemo(() => new MeshBasicMaterial({ side: DoubleSide, color: 0xffffff }), [])

  // Set up instance matrices — only when transforms change (not on filter change)
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || totalSlots === 0) return

    for (let i = 0; i < totalSlots; i++) {
      const t = transforms[i]
      if (t.isGhost) {
        tempObject.position.set(t.x, t.y, 0)
        tempObject.rotation.set(0, 0, 0)
        tempObject.scale.set(0, 0, 0)
      } else {
        tempObject.position.set(t.x, t.y, 0)
        tempObject.rotation.set(0, 0, t.rotationZ)
        tempObject.scale.set(1, 1, 1)
      }
      tempObject.updateMatrix()
      mesh.setMatrixAt(i, tempObject.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [transforms, totalSlots])

  // Update colors — separate effect so filtering is fast (no matrix recomputation)
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || totalSlots === 0) return

    for (let i = 0; i < totalSlots; i++) {
      const profileIdx = slotToProfile[i]
      if (profileIdx < 0 || profileIdx >= rawProfiles.length) {
        mesh.setColorAt(i, TRANSPARENT)
      } else {
        const matches = matchesFilter(rawProfiles[profileIdx], filters)
        mesh.setColorAt(i, matches ? BLACK : GREY)
      }
    }

    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [rawProfiles, filters, slotToProfile, totalSlots])

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const mesh = meshRef.current
      if (!mesh || e.instanceId === undefined) return
      const profileIdx = slotToProfile[e.instanceId]
      if (profileIdx < 0) return
      e.stopPropagation()
      const id = e.instanceId
      mesh.getColorAt(id, tempColor)
      prevColorRef.current = tempColor.clone()
      hoveredRef.current = id
      if (profileIdx < rawProfiles.length) {
        const matches = matchesFilter(rawProfiles[profileIdx], filters)
        mesh.setColorAt(id, matches ? HOVER_MATCH : HOVER_NON_MATCH)
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      }
    },
    [rawProfiles, filters, slotToProfile],
  )

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const mesh = meshRef.current
      if (!mesh || e.instanceId === undefined) return
      e.stopPropagation()
      const id = e.instanceId
      if (prevColorRef.current && hoveredRef.current === id) {
        mesh.setColorAt(id, prevColorRef.current)
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      }
      hoveredRef.current = null
      prevColorRef.current = null
    },
    [],
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (e.instanceId === undefined) return
      const profileIdx = slotToProfile[e.instanceId]
      if (profileIdx < 0) return
      e.stopPropagation()
      const profile = rawProfiles[profileIdx]
      if (!profile) return
      // Don't open modal for filtered-out pips
      if (!matchesFilter(profile, filters)) return
      setActiveProfile(profile)
    },
    [rawProfiles, setActiveProfile, slotToProfile, filters],
  )

  if (totalSlots === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, totalSlots]}
      frustumCulled={false}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    />
  )
}
