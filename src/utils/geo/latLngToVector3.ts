import { MathUtils, Quaternion, Vector3 } from 'three'

import type { GeoCoordinates, GlobeVectorConfig, SphericalAngles } from '@/types'

const WORLD_UP = new Vector3(0, 1, 0)

export interface GlobeSurfacePlacement {
  position: Vector3
  normal: Vector3
  quaternion: Quaternion
}

export function latLngToSphericalAngles(
  coordinates: GeoCoordinates,
): SphericalAngles {
  return {
    // phi is measured from north pole to south pole.
    phi: MathUtils.degToRad(90 - coordinates.lat),
    // theta rotates around vertical axis; +180 keeps [lng=0] on front hemisphere.
    theta: MathUtils.degToRad(coordinates.lng + 180),
  }
}

export function latLngToVector3(
  coordinates: GeoCoordinates,
  config: GlobeVectorConfig,
): Vector3 {
  const { phi, theta } = latLngToSphericalAngles(coordinates)
  const projectedRadius = config.radius + (config.surfaceOffset ?? 0)

  const x = -projectedRadius * Math.sin(phi) * Math.cos(theta)
  const y = projectedRadius * Math.cos(phi)
  const z = projectedRadius * Math.sin(phi) * Math.sin(theta)

  return new Vector3(x, y, z)
}

export function latLngToSurfacePlacement(
  coordinates: GeoCoordinates,
  config: GlobeVectorConfig,
): GlobeSurfacePlacement {
  const position = latLngToVector3(coordinates, config)
  const normal = position.clone().normalize()
  const quaternion = new Quaternion().setFromUnitVectors(WORLD_UP, normal)

  return {
    position,
    normal,
    quaternion,
  }
}

export function vector3ToLatLng(position: Vector3): GeoCoordinates {
  const normalized = position.clone().normalize()
  const lat = MathUtils.radToDeg(Math.asin(normalized.y))
  const lng = MathUtils.radToDeg(Math.atan2(normalized.z, -normalized.x)) - 180

  return {
    lat,
    lng,
  }
}
