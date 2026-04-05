import { useEffect, useMemo, useRef } from 'react'

import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils, SRGBColorSpace } from 'three'
import { Texture } from 'three'

import {
  GRID_MARKER_SCALE,
  gridInsectCells,
} from '@/data/insects/gridInsectCells'
import { insectCatalog } from '@/data/insects'
import { useAppStore } from '@/store/appStore'
import type { InsectCategory, InsectFilterCategory } from '@/types'

import { InsectMarkerSprite } from './InsectMarkerSprite'

function matchFilterCategory(
  activeCategory: InsectFilterCategory,
  markerCategory: InsectCategory,
) {
  return activeCategory === 'all' || activeCategory === markerCategory
}

export function InsectMarkersLayer() {
  const activeCategory = useAppStore((state) => state.activeCategory)
  const selectedPointId = useAppStore((state) => state.selectedPointId)
  const hoveredPointId = useAppStore((state) => state.hoveredPointId)
  const interactionLocked = useAppStore((state) => state.interactionLocked)
  const isFlying = useAppStore((state) => state.isFlying)
  const flightPhase = useAppStore((state) => state.flightPhase)
  const setSelection = useAppStore((state) => state.setSelection)
  const setHoveredTarget = useAppStore((state) => state.setHoveredTarget)
  const setCameraTarget = useAppStore((state) => state.setCameraTarget)
  const setFlyingState = useAppStore((state) => state.setFlyingState)
  const speciesTextureManifest = useMemo(
    () =>
      insectCatalog.reduce(
        (manifest, insect) => {
          manifest[insect.id] = `/insects/cutouts/${insect.slug}.png`
          return manifest
        },
        {} as Record<string, string>,
      ),
    [],
  )
  const speciesTextures = useTexture(
    speciesTextureManifest,
  ) as Record<string, Texture>
  const fallbackTextures = useTexture([
    '/insects/butterfly-marker.svg',
    '/insects/bee-marker.svg',
  ]) as Texture[]
  const flightProgressRef = useRef(0)
  const targetFlightProgressRef = useRef(0)
  const phaseRef = useRef(flightPhase)

  useEffect(() => {
    phaseRef.current = flightPhase
  }, [flightPhase])

  useEffect(() => {
    targetFlightProgressRef.current = isFlying ? 1 : 0
  }, [isFlying])

  useFrame((_, delta) => {
    const target = targetFlightProgressRef.current
    let nextProgress = MathUtils.damp(
      flightProgressRef.current,
      target,
      3.2,
      delta,
    )

    if (Math.abs(nextProgress - target) < 0.0015) {
      nextProgress = target
    }

    flightProgressRef.current = nextProgress

    if (target === 1 && nextProgress === 1 && phaseRef.current !== 'airborne') {
      phaseRef.current = 'airborne'
      setFlyingState({ phase: 'airborne' })
      return
    }

    if (target === 0 && nextProgress === 0 && phaseRef.current !== 'grounded') {
      phaseRef.current = 'grounded'
      setFlyingState({ phase: 'grounded' })
    }
  })

  const visibleCells = useMemo(
    () =>
      gridInsectCells.filter((cell) =>
        matchFilterCategory(activeCategory, cell.category),
      ),
    [activeCategory],
  )

  const fallbackTextureByCategory = useMemo<Record<InsectCategory, Texture>>(
    () => ({
      butterfly: fallbackTextures[0],
      bee: fallbackTextures[1],
    }),
    [fallbackTextures],
  )
  const speciesTextureById = useMemo(() => {
    const next = new Map<string, Texture>()
    Object.entries(speciesTextures).forEach(([insectId, texture]) => {
      texture.colorSpace = SRGBColorSpace
      texture.needsUpdate = true
      next.set(insectId, texture)
    })
    return next
  }, [speciesTextures])
  const insectById = useMemo(
    () => new Map(insectCatalog.map((insect) => [insect.id, insect] as const)),
    [],
  )

  const linePositions = useMemo(() => {
    const vertices: number[] = []

    for (const cell of visibleCells) {
      const [a, b, c, d] = cell.corners
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z)
      vertices.push(b.x, b.y, b.z, c.x, c.y, c.z)
      vertices.push(c.x, c.y, c.z, d.x, d.y, d.z)
      vertices.push(d.x, d.y, d.z, a.x, a.y, a.z)
    }

    return new Float32Array(vertices)
  }, [visibleCells])

  return (
    <group name="insect-markers-layer">
      {linePositions.length > 0 && (
        <lineSegments renderOrder={2}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#91ffd9"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </lineSegments>
      )}

      {visibleCells.map((cell) => (
        <InsectMarkerSprite
          key={cell.id}
          pointId={cell.id}
          insectId={cell.insectId}
          texture={
            speciesTextureById.get(cell.insectId) ??
            fallbackTextureByCategory[cell.category]
          }
          label={`${insectById.get(cell.insectId)?.commonNameZh ?? cell.label} · ${cell.label}`}
          weight={cell.weight}
          basePosition={cell.position}
          normal={cell.normal}
          isHovered={hoveredPointId === cell.id}
          isSelected={selectedPointId === cell.id}
          scaleMultiplier={GRID_MARKER_SCALE}
          flightProgressRef={flightProgressRef}
          onHover={(insectId, pointId) => {
            if (!interactionLocked) {
              setHoveredTarget(insectId, pointId)
            }
          }}
          onBlur={() => {
            setHoveredTarget(null)
          }}
          onSelect={(insectId, pointId) => {
            if (interactionLocked) {
              return
            }

            setSelection(insectId, pointId, 'scene')
            setCameraTarget({
              coordinates: { lat: cell.lat, lng: cell.lng },
              insectId,
              pointId,
              mode: 'insect',
              distance: 3.36,
              focusStrength: 0.86,
              polarAngle: 1.05,
              azimuthAngle: 0.22,
            })
          }}
        />
      ))}
    </group>
  )
}
