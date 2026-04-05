import { useMemo, useRef } from 'react'

import { Billboard, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import {
  Group,
  MathUtils,
  Sprite,
  Texture,
  Vector3,
} from 'three'

interface InsectMarkerSpriteProps {
  texture: Texture
  pointId: string
  insectId: string
  label: string
  weight: number
  basePosition: Vector3
  normal: Vector3
  isSelected: boolean
  isHovered: boolean
  scaleMultiplier?: number
  flightProgressRef: React.MutableRefObject<number>
  onHover: (insectId: string, pointId: string) => void
  onBlur: () => void
  onSelect: (insectId: string, pointId: string) => void
}

function hashToNormalizedSeed(input: string) {
  let hash = 0

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash % 997) / 997
}

export function InsectMarkerSprite({
  texture,
  pointId,
  insectId,
  label,
  weight,
  basePosition,
  normal,
  isSelected,
  isHovered,
  scaleMultiplier = 1,
  flightProgressRef,
  onHover,
  onBlur,
  onSelect,
}: InsectMarkerSpriteProps) {
  const markerRef = useRef<Sprite>(null)
  const labelAnchorRef = useRef<Group>(null)
  const baseScale = (0.115 + weight * 0.09) * scaleMultiplier
  const motionSeed = useMemo(() => hashToNormalizedSeed(pointId), [pointId])
  const tempPosition = useMemo(() => new Vector3(), [])
  const tempScale = useMemo(() => new Vector3(), [])
  const tangentA = useMemo(() => {
    const axis = Math.abs(normal.y) > 0.86 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0)
    return new Vector3().crossVectors(normal, axis).normalize()
  }, [normal])
  const tangentB = useMemo(
    () => new Vector3().crossVectors(normal, tangentA).normalize(),
    [normal, tangentA],
  )
  const flightLiftDistance = useMemo(
    () => 0.16 + weight * 0.2 + motionSeed * 0.12,
    [motionSeed, weight],
  )
  const driftAmplitude = useMemo(() => 0.012 + motionSeed * 0.018, [motionSeed])
  const driftFrequency = useMemo(() => 0.75 + motionSeed * 1.15, [motionSeed])
  const flutterFrequency = useMemo(() => 7.8 + motionSeed * 8.2, [motionSeed])

  useFrame((state, delta) => {
    if (!markerRef.current) {
      return
    }

    const elapsed = state.clock.elapsedTime * 1.15 + motionSeed * 8.2
    const flightProgress = MathUtils.smoothstep(flightProgressRef.current, 0, 1)
    const breathing =
      (Math.sin(elapsed) * 0.004 + Math.cos(elapsed * 0.65) * 0.002) *
      (1 - flightProgress * 0.55)
    const hoverLift = isHovered ? 0.014 : 0
    const selectLift = isSelected ? 0.022 : 0
    const lift = flightLiftDistance * flightProgress
    const driftA =
      Math.sin(elapsed * driftFrequency + motionSeed * 5.3) *
      driftAmplitude *
      flightProgress
    const driftB =
      Math.cos(elapsed * driftFrequency * 1.33 + motionSeed * 7.1) *
      driftAmplitude *
      0.75 *
      flightProgress

    // Flight and return are derived from immutable home position to avoid drift.
    tempPosition
      .copy(basePosition)
      .addScaledVector(normal, breathing + hoverLift + selectLift + lift)
      .addScaledVector(tangentA, driftA)
      .addScaledVector(tangentB, driftB)
    markerRef.current.position.copy(tempPosition)
    if (labelAnchorRef.current) {
      labelAnchorRef.current.position
        .copy(tempPosition)
        .addScaledVector(normal, 0.11 + 0.06 * flightProgress)
    }

    const flutterScale =
      1 + Math.sin(elapsed * flutterFrequency) * 0.06 * flightProgress
    const targetScale =
      baseScale * (isSelected ? 1.32 : isHovered ? 1.15 : 1) * flutterScale
    const easing = 1 - Math.exp(-delta * 11)

    tempScale.setScalar(targetScale)
    markerRef.current.scale.lerp(tempScale, easing)
  })

  return (
    <group>
      <sprite
        ref={markerRef}
        renderOrder={4}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(insectId, pointId)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          onBlur()
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(insectId, pointId)
        }}
      >
        <spriteMaterial
          map={texture}
          transparent
          alphaTest={0.04}
          depthWrite={false}
          opacity={MathUtils.lerp(0.9, 1, weight)}
        />
      </sprite>

      {(isHovered || isSelected) && (
        <group ref={labelAnchorRef}>
          <Billboard>
            <Text
              fontSize={0.022}
              maxWidth={0.62}
              color={isSelected ? '#f3ffe0' : '#d8f7ff'}
              anchorX="center"
              anchorY="middle"
              outlineColor="#041115"
              outlineWidth={0.0022}
            >
              {label}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  )
}
