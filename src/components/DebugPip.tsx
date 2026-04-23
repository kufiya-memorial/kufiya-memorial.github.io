/**
 * Minimal debug component — renders a single red plane at origin.
 * If this is visible, PlaneGeometry works. If not, something else is wrong.
 */
export function DebugPip() {
  return (
    <mesh position={[0, 0, 0.1]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="red" side={2} />
    </mesh>
  )
}
