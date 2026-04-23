import { useMemo, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useMemorialStore } from '../store/useMemorialStore'
import { computeLayout, computeLineConnections } from '../utils/layout'
import { SPACING } from './LatticeMesh'
import {
  BufferGeometry,
  Float32BufferAttribute,
  LineDashedMaterial,
  LineSegments as LineSegmentsType,
} from 'three'

const LINE_COLOR = 0x000000
const PIP_RY = SPACING * 0.20
const LINE_OFFSET = PIP_RY * 0.8

export function LatticeLines() {
  const lineRef = useRef<LineSegmentsType>(null)
  const { size } = useThree()
  const rawProfiles = useMemorialStore((s) => s.rawProfiles)
  const count = rawProfiles.length

  const layoutResult = useMemo(
    () => computeLayout(count, SPACING, size.width, size.height),
    [count, size.width, size.height],
  )

  const { transforms, cols } = layoutResult

  const geometry = useMemo(() => {
    if (transforms.length === 0 || cols === 0) return new BufferGeometry()

    const connections = computeLineConnections(transforms, cols)
    const positions = new Float32Array(connections.length * 6)

    for (let i = 0; i < connections.length; i++) {
      const [fromIdx, toIdx] = connections[i]
      const from = transforms[fromIdx]
      const to = transforms[toIdx]

      const fromY = from.y - LINE_OFFSET
      const toY = to.y + LINE_OFFSET

      const offset = i * 6
      positions[offset] = from.x
      positions[offset + 1] = fromY
      positions[offset + 2] = 0
      positions[offset + 3] = to.x
      positions[offset + 4] = toY
      positions[offset + 5] = 0
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [transforms, cols])

  const material = useMemo(
    () => new LineDashedMaterial({ color: LINE_COLOR, dashSize: 0.06, gapSize: 0.06 }),
    [],
  )

  useEffect(() => {
    const line = lineRef.current
    if (line && transforms.length > 0) line.computeLineDistances()
  }, [geometry, transforms.length])

  if (transforms.length === 0) return null

  return <lineSegments ref={lineRef} geometry={geometry} material={material} />
}
