import { useMemo } from 'react'

import { Text } from '@react-three/drei'
import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import { globeLabels, type GlobeLabelTier } from '@/data/geo/globeLabels'
import { useAppStore } from '@/store/appStore'
import { latLngToSurfacePlacement } from '@/utils/geo'

interface GlobeLabelsProps {
  radius: number
}

interface LabelStyle {
  fontSize: number
  color: string
  opacity: number
  surfaceOffset: number
}

const UP_AXIS = new Vector3(0, 1, 0)
const EAST_FALLBACK_AXIS = new Vector3(1, 0, 0)

const LABEL_STYLES: Record<GlobeLabelTier, LabelStyle> = {
  continent: {
    fontSize: 0.094,
    color: '#d7ebff',
    opacity: 0.3,
    surfaceOffset: 0.0055,
  },
  ocean: {
    fontSize: 0.068,
    color: '#9bc6ea',
    opacity: 0.25,
    surfaceOffset: 0.0045,
  },
  country: {
    fontSize: 0.026,
    color: '#cae1f8',
    opacity: 0.18,
    surfaceOffset: 0.0036,
  },
}

function buildTangentQuaternion(normal: Vector3, rotationDeg = 0) {
  const east = new Vector3().crossVectors(UP_AXIS, normal)

  if (east.lengthSq() < 0.000001) {
    east.crossVectors(EAST_FALLBACK_AXIS, normal)
  }

  east.normalize()
  const north = new Vector3().crossVectors(normal, east).normalize()
  const basisMatrix = new Matrix4().makeBasis(east, north, normal)
  const orientation = new Quaternion().setFromRotationMatrix(basisMatrix)

  if (rotationDeg !== 0) {
    const spin = new Quaternion().setFromAxisAngle(
      normal,
      MathUtils.degToRad(rotationDeg),
    )
    orientation.multiply(spin)
  }

  return orientation
}

export function GlobeLabels({ radius }: GlobeLabelsProps) {
  const showCountryLabels = useAppStore((state) => state.showCountryLabels)
  const resolvedLabels = useMemo(
    () =>
      globeLabels.map((label) => {
        const style = LABEL_STYLES[label.tier]
        const placement = latLngToSurfacePlacement(
          { lat: label.lat, lng: label.lng },
          { radius, surfaceOffset: style.surfaceOffset },
        )

        return {
          ...label,
          style,
          position: placement.position,
          visible: showCountryLabels || label.tier !== 'country',
          quaternion: buildTangentQuaternion(
            placement.normal,
            label.rotationDeg ?? 0,
          ),
        }
      }),
    [radius, showCountryLabels],
  )

  return (
    <group name="globe-labels">
      {resolvedLabels.map((label) => (
        <group
          key={label.id}
          position={label.position}
          quaternion={label.quaternion}
          renderOrder={1}
        >
          <Text
            raycast={() => null}
            color={label.style.color}
            fontSize={label.style.fontSize}
            fillOpacity={label.style.opacity}
            maxWidth={label.tier === 'country' ? 0.3 : 1.75}
            anchorX="center"
            anchorY="middle"
            lineHeight={1}
            letterSpacing={label.tier === 'country' ? 0.008 : 0.016}
            outlineWidth={label.tier === 'country' ? 0.0015 : 0.0025}
            outlineColor="#0a2033"
            visible={label.visible}
            depthOffset={0.08}
          >
            {label.text}
          </Text>
        </group>
      ))}
    </group>
  )
}
