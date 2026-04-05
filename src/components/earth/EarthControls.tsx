import { useMemo, useRef } from 'react'

import { OrbitControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Euler, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { useAppStore } from '@/store/appStore'
import { latLngToVector3 } from '@/utils/geo'

// Keep camera math aligned with the scene graph transform in EarthScene + GlobeBase.
const GLOBE_CENTER = new Vector3(0, -0.1, 0)
const GLOBE_ROTATION = new Euler(0.3, -0.28, 0.08)

export function EarthControls() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const interactionLocked = useAppStore((state) => state.interactionLocked)
  const cameraTarget = useAppStore((state) => state.cameraTarget)
  const desiredCameraPosition = useMemo(() => new Vector3(), [])
  const focusDirection = useMemo(() => new Vector3(), [])
  const localDirection = useMemo(() => new Vector3(), [])
  const previousCameraTargetRef = useRef(cameraTarget)
  const isAutoFocusingRef = useRef(true)
  const isUserInteractingRef = useRef(false)

  useFrame((_, delta) => {
    const controls = controlsRef.current

    if (!controls || !cameraTarget) {
      return
    }

    if (previousCameraTargetRef.current !== cameraTarget) {
      previousCameraTargetRef.current = cameraTarget
      isAutoFocusingRef.current = true
    }

    if (isUserInteractingRef.current || !isAutoFocusingRef.current) {
      return
    }

    // Move camera along target geo-normal so selected cell turns toward viewer.
    localDirection
      .copy(latLngToVector3(cameraTarget.coordinates, { radius: 1 }))
      .normalize()
      .applyEuler(GLOBE_ROTATION)
    focusDirection.copy(localDirection).normalize()

    desiredCameraPosition
      .copy(GLOBE_CENTER)
      .addScaledVector(focusDirection, cameraTarget.distance)

    const easing = 1 - Math.exp(-delta * 4.2)
    controls.object.position.lerp(desiredCameraPosition, easing)
    controls.target.lerp(GLOBE_CENTER, easing)
    controls.update()

    const remainingPositionDistance = controls.object.position.distanceTo(
      desiredCameraPosition,
    )
    const remainingTargetDistance = controls.target.distanceTo(GLOBE_CENTER)

    if (remainingPositionDistance < 0.01 && remainingTargetDistance < 0.005) {
      isAutoFocusingRef.current = false
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={!interactionLocked}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.42}
      zoomSpeed={0.8}
      enablePan={false}
      minDistance={2.85}
      maxDistance={8.6}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
      target={GLOBE_CENTER.toArray()}
      onStart={() => {
        isUserInteractingRef.current = true
        isAutoFocusingRef.current = false
      }}
      onEnd={() => {
        isUserInteractingRef.current = false
      }}
    />
  )
}
