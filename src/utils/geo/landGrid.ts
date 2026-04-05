import type { Vector3 } from 'three'

import type { GeoCoordinates, GlobeVectorConfig, Insect, InsectCategory } from '@/types'
import { BIO_REGION_LABELS, detectBioRegion } from '@/utils/geo/bioregion'
import { latLngToSurfacePlacement } from '@/utils/geo/latLngToVector3'
import {
  checkCoordinatesOnLand,
  normalizeLandFeatureCollection,
  type LandFeatureCollection,
} from '@/utils/geo/landMask'

export interface LandGridBuildOptions {
  latStep: number
  lngStep: number
  maxCells?: number
  markerPlacement: GlobeVectorConfig
  gridPlacement: GlobeVectorConfig
}

export interface LandGridCell {
  id: string
  lat: number
  lng: number
  insectId: string
  category: InsectCategory
  label: string
  country: string
  weight: number
  position: Vector3
  normal: Vector3
  corners: [Vector3, Vector3, Vector3, Vector3]
}

function clampLatitude(value: number) {
  return Math.min(89.8, Math.max(-89.8, value))
}

function hashToUnit(seed: string) {
  let hash = 0

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash % 1009) / 1009
}

function pickInsectByCategory(
  insects: Insect[],
  category: InsectCategory,
  region: ReturnType<typeof detectBioRegion>,
  seed: string,
  usageByBucket: Map<string, Map<string, number>>,
  avoidInsectIds: ReadonlySet<string>,
) {
  const regionScopedItems = insects.filter(
    (insect) =>
      insect.category === category &&
      insect.nativeRegions.includes(region),
  )

  if (regionScopedItems.length === 0) {
    return null
  }

  const bucketKey = `${region}:${category}`
  const usageBucket = usageByBucket.get(bucketKey) ?? new Map<string, number>()

  if (!usageByBucket.has(bucketKey)) {
    usageByBucket.set(bucketKey, usageBucket)
  }

  let minUsage = Number.POSITIVE_INFINITY
  for (const insect of regionScopedItems) {
    const usage = usageBucket.get(insect.id) ?? 0
    if (usage < minUsage) {
      minUsage = usage
    }
  }

  const leastUsedItems = regionScopedItems.filter(
    (insect) => (usageBucket.get(insect.id) ?? 0) === minUsage,
  )
  const nonAdjacentItems = leastUsedItems.filter(
    (insect) => !avoidInsectIds.has(insect.id),
  )
  const candidatePool = nonAdjacentItems.length > 0 ? nonAdjacentItems : leastUsedItems
  const index = Math.floor(hashToUnit(seed) * candidatePool.length)
  const selected = candidatePool[index] ?? candidatePool[0]

  usageBucket.set(selected.id, (usageBucket.get(selected.id) ?? 0) + 1)
  return selected
}

function hasRegionCategorySpecies(
  insects: Insect[],
  region: ReturnType<typeof detectBioRegion>,
  category: InsectCategory,
) {
  return insects.some(
    (insect) =>
      insect.category === category && insect.nativeRegions.includes(region),
  )
}

function resolveCellCategory(
  insects: Insect[],
  region: ReturnType<typeof detectBioRegion>,
  preferredCategory: InsectCategory,
) {
  if (hasRegionCategorySpecies(insects, region, preferredCategory)) {
    return preferredCategory
  }

  const altCategory: InsectCategory =
    preferredCategory === 'butterfly' ? 'bee' : 'butterfly'

  if (hasRegionCategorySpecies(insects, region, altCategory)) {
    return altCategory
  }

  return null
}

function buildCellCorners(
  coordinates: GeoCoordinates,
  latStep: number,
  lngStep: number,
  placement: GlobeVectorConfig,
): [Vector3, Vector3, Vector3, Vector3] {
  const halfLat = latStep / 2
  const halfLng = lngStep / 2

  const north = clampLatitude(coordinates.lat + halfLat)
  const south = clampLatitude(coordinates.lat - halfLat)
  const west = coordinates.lng - halfLng
  const east = coordinates.lng + halfLng

  const topLeft = latLngToSurfacePlacement({ lat: north, lng: west }, placement).position
  const topRight = latLngToSurfacePlacement({ lat: north, lng: east }, placement).position
  const bottomRight = latLngToSurfacePlacement(
    { lat: south, lng: east },
    placement,
  ).position
  const bottomLeft = latLngToSurfacePlacement(
    { lat: south, lng: west },
    placement,
  ).position

  return [topLeft, topRight, bottomRight, bottomLeft]
}

function downsampleCells(cells: LandGridCell[], maxCells: number) {
  if (cells.length <= maxCells) {
    return cells
  }

  const stride = Math.ceil(cells.length / maxCells)
  return cells.filter((_, index) => index % stride === 0).slice(0, maxCells)
}

export function buildLandGridCells(
  insects: Insect[],
  rawLandCollection: LandFeatureCollection,
  options: LandGridBuildOptions,
) {
  const { latStep, lngStep, maxCells = 1400, markerPlacement, gridPlacement } = options
  const normalizedLand = normalizeLandFeatureCollection(rawLandCollection)
  const cells: LandGridCell[] = []
  const usageByBucket = new Map<string, Map<string, number>>()
  let previousRowInsects = new Map<number, string>()
  let secondPreviousRowInsects = new Map<number, string>()

  for (
    let lat = -60 + latStep / 2;
    lat <= 78 - latStep / 2;
    lat += latStep
  ) {
    const currentRowInsects = new Map<number, string>()

    for (
      let lng = -180 + lngStep / 2, lngIndex = 0;
      lng <= 180 - lngStep / 2;
      lng += lngStep, lngIndex += 1
    ) {
      const onLand = checkCoordinatesOnLand(lat, lng, normalizedLand)

      if (!onLand.isOnLand) {
        continue
      }

      const region = detectBioRegion(lat, lng)

      if (region === 'antarctica') {
        continue
      }

      const seed = `${lat.toFixed(3)}:${lng.toFixed(3)}`
      const preferredCategory: InsectCategory =
        Math.round((lat + lng) / Math.max(latStep, 1)) % 2 === 0
          ? 'butterfly'
          : 'bee'
      const category = resolveCellCategory(insects, region, preferredCategory)

      if (!category) {
        continue
      }

      const avoidInsectIds = new Set<string>()
      const leftNeighborId = currentRowInsects.get(lngIndex - 1)
      const leftNeighborId2 = currentRowInsects.get(lngIndex - 2)
      const upperNeighborId = previousRowInsects.get(lngIndex)
      const upperLeftNeighborId = previousRowInsects.get(lngIndex - 1)
      const upperRightNeighborId = previousRowInsects.get(lngIndex + 1)
      const secondUpperNeighborId = secondPreviousRowInsects.get(lngIndex)

      if (leftNeighborId) {
        avoidInsectIds.add(leftNeighborId)
      }
      if (leftNeighborId2) {
        avoidInsectIds.add(leftNeighborId2)
      }
      if (upperNeighborId) {
        avoidInsectIds.add(upperNeighborId)
      }
      if (upperLeftNeighborId) {
        avoidInsectIds.add(upperLeftNeighborId)
      }
      if (upperRightNeighborId) {
        avoidInsectIds.add(upperRightNeighborId)
      }
      if (secondUpperNeighborId) {
        avoidInsectIds.add(secondUpperNeighborId)
      }

      const insect = pickInsectByCategory(
        insects,
        category,
        region,
        seed,
        usageByBucket,
        avoidInsectIds,
      )

      if (!insect) {
        continue
      }

      currentRowInsects.set(lngIndex, insect.id)

      const placement = latLngToSurfacePlacement({ lat, lng }, markerPlacement)
      const corners = buildCellCorners({ lat, lng }, latStep, lngStep, gridPlacement)
      const weight = 0.52 + hashToUnit(seed) * 0.42

      cells.push({
        id: `grid-cell-${lat.toFixed(2)}-${lng.toFixed(2)}`,
        lat,
        lng,
        insectId: insect.id,
        category,
        label: insect.commonNameEn,
        country: BIO_REGION_LABELS[region],
        weight,
        position: placement.position,
        normal: placement.normal,
        corners,
      })
    }

    secondPreviousRowInsects = previousRowInsects
    previousRowInsects = currentRowInsects
  }

  return downsampleCells(cells, maxCells)
}
