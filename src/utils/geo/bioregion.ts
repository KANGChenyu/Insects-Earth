import type { BioRegionKey } from '@/types'

export const BIO_REGION_LABELS: Record<BioRegionKey, string> = {
  'north-america': 'North America',
  'south-america': 'South America',
  europe: 'Europe',
  africa: 'Africa',
  asia: 'Asia',
  oceania: 'Oceania',
  antarctica: 'Antarctica',
}

function normalizeLongitude(lng: number) {
  if (lng > 180) {
    return ((lng + 180) % 360) - 180
  }

  if (lng < -180) {
    return ((lng - 180) % 360) + 180
  }

  return lng
}

function inRange(value: number, min: number, max: number) {
  return value >= min && value <= max
}

/**
 * Lightweight continent-scale classifier used to keep species assignments
 * region-aware without adding heavy reverse-geocoding dependencies.
 */
export function detectBioRegion(lat: number, lng: number): BioRegionKey {
  const normalizedLng = normalizeLongitude(lng)

  if (lat <= -60) {
    return 'antarctica'
  }

  if (inRange(lat, 7, 84) && inRange(normalizedLng, -170, -50)) {
    return 'north-america'
  }

  if (inRange(lat, -56, 13) && inRange(normalizedLng, -84, -34)) {
    return 'south-america'
  }

  if (inRange(lat, 35, 72) && inRange(normalizedLng, -25, 45)) {
    return 'europe'
  }

  if (inRange(lat, -36, 38) && inRange(normalizedLng, -20, 55)) {
    return 'africa'
  }

  if (
    (inRange(lat, -50, 5) && inRange(normalizedLng, 110, 180)) ||
    (inRange(lat, -50, 5) && inRange(normalizedLng, -180, -140))
  ) {
    return 'oceania'
  }

  return 'asia'
}
