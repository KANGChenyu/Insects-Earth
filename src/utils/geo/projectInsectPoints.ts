import type { Vector3 } from 'three'

import type { GlobeVectorConfig, Insect } from '@/types'
import { latLngToSurfacePlacement } from '@/utils/geo/latLngToVector3'

export interface ProjectedInsectPoint {
  insectId: string
  pointId: string
  category: Insect['category']
  lat: number
  lng: number
  position: Vector3
  normal: Vector3
}

export function projectInsectPoints(
  insects: Insect[],
  config: GlobeVectorConfig,
): ProjectedInsectPoint[] {
  return insects.flatMap((insect) =>
    insect.points.map((point) => {
      const placement = latLngToSurfacePlacement(point, config)

      return {
        insectId: insect.id,
        pointId: point.id,
        category: insect.category,
        lat: point.lat,
        lng: point.lng,
        position: placement.position,
        normal: placement.normal,
      }
    }),
  )
}
