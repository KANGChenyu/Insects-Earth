import { useEffect } from 'react'

import { Stars } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { createCameraTargetPreset } from '@/store/appStore'
import { useAppStore } from '@/store/appStore'

import { EarthControls } from './EarthControls'
import { GlobeBase } from './GlobeBase'
import { SceneLighting } from './SceneLighting'

function EarthSceneContents() {
  return (
    <>
      <fog attach="fog" args={['#081628', 7.4, 14.6]} />
      <Stars
        radius={96}
        depth={32}
        count={5600}
        factor={3.8}
        saturation={0}
        fade
        speed={0.35}
      />
      <SceneLighting />
      <EarthControls />
      <group position={[0, -0.1, 0]} scale={1}>
        <GlobeBase />
      </group>
    </>
  )
}

export function EarthScene() {
  const setSceneReady = useAppStore((state) => state.setSceneReady)
  const setSelection = useAppStore((state) => state.setSelection)
  const setPanelOpen = useAppStore((state) => state.setPanelOpen)
  const setHoveredTarget = useAppStore((state) => state.setHoveredTarget)
  const setCameraTarget = useAppStore((state) => state.setCameraTarget)

  useEffect(() => {
    return () => {
      setSceneReady(false)
    }
  }, [setSceneReady])

  return (
    <div className="earth-canvas">
      <Canvas
        camera={{ position: [0, 0.03, 5.15], fov: 28, near: 0.1, far: 100 }}
        dpr={[1, 1.8]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearAlpha(0)
          gl.toneMappingExposure = 1.12
          setSceneReady(true)
        }}
        onPointerMissed={() => {
          setHoveredTarget(null)
          setSelection(null, null, 'scene')
          setPanelOpen(false)
          setCameraTarget(createCameraTargetPreset())
        }}
      >
        <EarthSceneContents />
      </Canvas>
    </div>
  )
}
