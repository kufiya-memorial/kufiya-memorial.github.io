import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, Mesh } from 'three'

/**
 * Glimmer overlay that follows the camera.
 * Uses screen-space UVs so the effect is consistent at any zoom/pan.
 */
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
    // Diagonal sweep across the screen
    float sweep1 = vUv.x + vUv.y;
    float t1 = mod(uTime * 0.12, 3.0);
    float g1 = smoothstep(0.2, 0.0, abs(sweep1 - t1)) * 0.2;

    // Counter sweep
    float sweep2 = vUv.x - vUv.y + 1.0;
    float t2 = mod(uTime * 0.18 + 1.5, 3.0);
    float g2 = smoothstep(0.15, 0.0, abs(sweep2 - t2)) * 0.15;

    // Sparkle
    float n = fract(sin(dot(vUv * 100.0, vec2(12.9898, 78.233)) + uTime * 0.4) * 43758.5453);
    float sparkle = step(0.992, n) * 0.35;

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
    // Follow camera and scale to cover the visible area
    if (meshRef.current) {
      const cam = camera as any
      const z = cam.position.z
      const fovRad = (cam.fov * Math.PI) / 180
      const visH = 2 * z * Math.tan(fovRad / 2)
      // Scale the plane to exactly cover the visible area
      meshRef.current.position.set(camera.position.x, camera.position.y, 0.01)
      meshRef.current.scale.set(visH * 2, visH * 2, 1) // oversized to cover
    }
  })

  return (
    <mesh ref={meshRef} renderOrder={999}>
      <planeGeometry args={[1, 1]} />
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
