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

// Vertical offset: lines start near the bottom of the "from" pip
// and end near the top of the "to" pip (in Y only, X stays at pip center)
const Y_OFFSET = -0.1

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

      // Line starts near the bottom of the "from" pip (Y - offset)
      // Line ends near the top of the "to" pip (Y + offset)
      // X stays at the pip centers — the diagonal comes from the X difference
      // between connected pips (odd/even row offset)
      const offset = i * 6
      positions[offset] = from.x
      positions[offset + 1] = from.y - Y_OFFSET
      positions[offset + 2] = 0
      positions[offset + 3] = to.x
      positions[offset + 4] = to.y + Y_OFFSET
      positions[offset + 5] = 0
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [transforms, cols])

  const material = useMemo(
    () => new LineDashedMaterial({
      color: LINE_COLOR,
      dashSize: 0.05,
      gapSize: 0.05,
    }),
    [],
  )

  useEffect(() => {
    const line = lineRef.current
    if (line && transforms.length > 0) line.computeLineDistances()
  }, [geometry, transforms.length])

  if (transforms.length === 0) return null

  return <lineSegments ref={lineRef} geometry={geometry} material={material} />
}
