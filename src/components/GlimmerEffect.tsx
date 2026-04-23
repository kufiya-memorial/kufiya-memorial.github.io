import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial } from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    // Primary diagonal sweep — slow, wide, soft
    float sweep1 = vUv.x + vUv.y;
    float t1 = mod(uTime * 0.08, 3.5);
    float g1 = smoothstep(0.25, 0.0, abs(sweep1 - t1)) * 0.08;

    // Secondary sweep — opposite direction, faster, narrower
    float sweep2 = vUv.x - vUv.y + 1.0;
    float t2 = mod(uTime * 0.12 + 1.5, 3.5);
    float g2 = smoothstep(0.12, 0.0, abs(sweep2 - t2)) * 0.05;

    // Subtle sparkle noise
    float n = fract(sin(dot(vUv * 200.0, vec2(12.9898, 78.233)) + uTime * 0.3) * 43758.5453);
    float sparkle = step(0.997, n) * 0.15;

    float alpha = g1 + g2 + sparkle;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

export function GlimmerEffect() {
  const matRef = useRef<ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
  })

  return (
    <mesh position={[0, 0, 0.01]} renderOrder={999}>
      <planeGeometry args={[300, 300]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        uniforms={{ uTime: { value: 0 } }}
      />
    </mesh>
  )
}
