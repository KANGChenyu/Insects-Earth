import { booleanPointInPolygon, point } from '@turf/turf'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

import type { Insect, InsectPoint, LandCheckResult, LandFeatureProperties } from '@/types'

export type LandGeometry = Polygon | MultiPolygon

export type LandFeature = Feature<LandGeometry, LandFeatureProperties>

export type LandFeatureCollection = FeatureCollection<
  LandGeometry,
  LandFeatureProperties
>

export interface LandValidationSummary {
  totalCheckedPoints: number
  validLandPoints: number
  filteredOceanPoints: number
  insectsWithNoValidPoints: string[]
  droppedPointIds: string[]
}

export interface LandValidationResult {
  insects: Insect[]
  summary: LandValidationSummary
}

export interface ValidateInsectsOnLandOptions {
  dropOceanPoints?: boolean
}

function isLandGeometryType(
  geometryType: string,
): geometryType is LandGeometry['type'] {
  return geometryType === 'Polygon' || geometryType === 'MultiPolygon'
}

function toFeatureName(
  feature: LandFeature,
  fallbackId: string,
) {
  return (
    feature.properties?.name ??
    feature.properties?.continent ??
    feature.properties?.isoA3 ??
    feature.properties?.isoA2 ??
    feature.properties?.id ??
    fallbackId
  )
}

export function normalizeLandFeatureCollection(
  featureCollection: FeatureCollection,
): LandFeatureCollection {
  const features: LandFeature[] = featureCollection.features
    .filter((feature): feature is LandFeature => {
      if (!feature.geometry) {
        return false
      }

      return isLandGeometryType(feature.geometry.type)
    })
    .map((feature, index) => {
      const fallbackId = `land-${index + 1}`

      return {
        ...feature,
        properties: {
          ...feature.properties,
          id:
            (feature.properties?.id as string | undefined) ??
            (feature.id as string | undefined) ??
            fallbackId,
          name: toFeatureName(feature, fallbackId),
        },
      }
    })

  return {
    type: 'FeatureCollection',
    features,
  }
}

export function checkCoordinatesOnLand(
  lat: number,
  lng: number,
  landCollection: LandFeatureCollection,
): LandCheckResult {
  const testPoint = point([lng, lat])

  for (const [index, feature] of landCollection.features.entries()) {
    if (booleanPointInPolygon(testPoint, feature, { ignoreBoundary: false })) {
      return {
        isOnLand: true,
        matchedFeatureId:
          feature.properties?.id ??
          (feature.id as string | undefined) ??
          `land-${index + 1}`,
        matchedFeatureName: toFeatureName(feature, `land-${index + 1}`),
        confidence: 'verified',
      }
    }
  }

  return {
    isOnLand: false,
    confidence: 'verified',
  }
}

export function validateInsectsOnLand(
  insects: Insect[],
  sourceLandCollection: FeatureCollection,
  options: ValidateInsectsOnLandOptions = {},
): LandValidationResult {
  const { dropOceanPoints = true } = options
  const landCollection = normalizeLandFeatureCollection(sourceLandCollection)

  const summary: LandValidationSummary = {
    totalCheckedPoints: 0,
    validLandPoints: 0,
    filteredOceanPoints: 0,
    insectsWithNoValidPoints: [],
    droppedPointIds: [],
  }

  const validatedInsects = insects.map((insect) => {
    const validatedPoints: InsectPoint[] = []

    for (const pointEntry of insect.points) {
      summary.totalCheckedPoints += 1

      const landCheck = checkCoordinatesOnLand(
        pointEntry.lat,
        pointEntry.lng,
        landCollection,
      )

      const validatedPoint: InsectPoint = {
        ...pointEntry,
        verifiedOnLand: landCheck.isOnLand,
        landCheck,
      }

      if (landCheck.isOnLand) {
        summary.validLandPoints += 1
        validatedPoints.push(validatedPoint)
        continue
      }

      summary.filteredOceanPoints += 1
      summary.droppedPointIds.push(pointEntry.id)

      if (!dropOceanPoints) {
        validatedPoints.push(validatedPoint)
      }
    }

    if (validatedPoints.length === 0) {
      summary.insectsWithNoValidPoints.push(insect.id)
    }

    return {
      ...insect,
      points: validatedPoints,
    }
  })

  return {
    insects: validatedInsects,
    summary,
  }
}
