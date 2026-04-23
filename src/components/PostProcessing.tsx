import { EffectComposer, Bloom } from '@react-three/postprocessing'

export function PostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.3}
        luminanceThreshold={0.0}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
    </EffectComposer>
  )
}
