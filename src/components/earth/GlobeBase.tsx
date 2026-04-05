import { useEffect, useMemo, useRef } from 'react'

import { useTexture } from '@react-three/drei'
import {
  AdditiveBlending,
  BackSide,
  Group,
  MathUtils,
  SRGBColorSpace,
  Vector2,
} from 'three'

import { earthTextureManifest } from '@/assets/earth/earthTextureManifest'
import { InsectMarkersLayer } from '@/components/insects'
import { createEarthTextureSet } from '@/utils/earth/createEarthTextures'

import { GlobeLabels } from './GlobeLabels'

interface GlobeBaseProps {
  radius?: number
}

const LATITUDE_BANDS = [-60, -30, 0, 30, 60]
const LONGITUDE_RINGS = [0, Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4]

function GlobeGrid({ radius }: Required<GlobeBaseProps>) {
  const latitudeMeshes = useMemo(
    () =>
      LATITUDE_BANDS.map((lat) => {
        const radians = MathUtils.degToRad(lat)

        return {
          id: `lat-${lat}`,
          ringRadius: Math.cos(radians) * radius,
          y: Math.sin(radians) * radius,
        }
      }),
    [radius],
  )

  return (
    <group>
      {latitudeMeshes.map((band) => (
        <mesh key={band.id} position-y={band.y} rotation-x={Math.PI / 2}>
          <torusGeometry args={[band.ringRadius, 0.0045, 10, 96]} />
          <meshBasicMaterial
            color="#8bdfff"
            opacity={0.11}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}

      {LONGITUDE_RINGS.map((rotation) => (
        <mesh key={`lng-${rotation}`} rotation-z={rotation}>
          <torusGeometry args={[radius, 0.0045, 10, 120]} />
          <meshBasicMaterial
            color="#8bdfff"
            opacity={0.09}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

export function GlobeBase({ radius = 1.68 }: GlobeBaseProps) {
  const globeRef = useRef<Group>(null)
  const fallbackTextures = useMemo(() => createEarthTextureSet(), [])
  const sourceAlbedoTexture = useTexture(earthTextureManifest.albedoUrl ?? '')
  const normalTexture = useTexture(earthTextureManifest.normalUrl ?? '')
  const oceanMaskTexture = useTexture(earthTextureManifest.oceanMaskUrl ?? '')
  const sourceCloudTexture = useTexture(earthTextureManifest.cloudUrl ?? '')
  const albedoTexture = useMemo(() => {
    const nextTexture = sourceAlbedoTexture.clone()
    nextTexture.colorSpace = SRGBColorSpace
    return nextTexture
  }, [sourceAlbedoTexture])
  const cloudTexture = useMemo(() => {
    const nextTexture = sourceCloudTexture.clone()
    nextTexture.colorSpace = SRGBColorSpace
    return nextTexture
  }, [sourceCloudTexture])

  useEffect(() => {
    return () => {
      Object.values(fallbackTextures).forEach((texture) => texture.dispose())
      albedoTexture.dispose()
      cloudTexture.dispose()
    }
  }, [albedoTexture, cloudTexture, fallbackTextures])

  return (
    <group ref={globeRef} rotation={[0.3, -0.28, 0.08]}>
      <mesh>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial
          map={albedoTexture}
          normalMap={normalTexture}
          normalScale={new Vector2(0.62, 0.62)}
          bumpMap={fallbackTextures.bump}
          bumpScale={0.008}
          roughness={0.82}
          metalness={0.01}
          color="#ffffff"
        />
      </mesh>

      <mesh scale={1.002}>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial
          alphaMap={oceanMaskTexture}
          transparent
          opacity={0.44}
          depthWrite={false}
          color="#1f4f8f"
          emissive="#0b2d5a"
          emissiveIntensity={0.21}
          roughness={0.36}
          metalness={0.18}
        />
      </mesh>

      <mesh scale={1.012}>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial
          alphaMap={cloudTexture}
          transparent
          opacity={0.19}
          depthWrite={false}
          color="#f2fbff"
          emissive="#dbe9ff"
          emissiveIntensity={0.025}
        />
      </mesh>

      <mesh scale={1.045}>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshBasicMaterial
          color="#57a2ff"
          transparent
          opacity={0.07}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <GlobeLabels radius={radius} />

      <InsectMarkersLayer />

      <mesh scale={1.08}>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshBasicMaterial
          color="#96d4ff"
          transparent
          opacity={0.075}
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <GlobeGrid radius={radius} />
    </group>
  )
}
