import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Mesh } from 'three'

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
    // Primary diagonal sweep
    float sweep1 = vUv.x + vUv.y;
    float t1 = mod(uTime * 0.1, 3.5);
    float g1 = smoothstep(0.3, 0.0, abs(sweep1 - t1)) * 0.18;

    // Secondary sweep — opposite direction
    float sweep2 = vUv.x - vUv.y + 1.0;
    float t2 = mod(uTime * 0.14 + 1.5, 3.5);
    float g2 = smoothstep(0.2, 0.0, abs(sweep2 - t2)) * 0.12;

    // Subtle sparkle
    float n = fract(sin(dot(vUv * 200.0, vec2(12.9898, 78.233)) + uTime * 0.3) * 43758.5453);
    float sparkle = step(0.995, n) * 0.25;

    float alpha = g1 + g2 + sparkle;
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`

export function GlimmerEffect() {
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<ShaderMaterial>(null)

  useFrame(({ clock, camera }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
    // Follow the camera so the glimmer always covers the visible area
    if (meshRef.current) {
      meshRef.current.position.x = camera.position.x
      meshRef.current.position.y = camera.position.y
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]} renderOrder={999}>
      <planeGeometry args={[1000, 1000]} />
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
