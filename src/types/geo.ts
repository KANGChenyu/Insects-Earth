export interface GeoCoordinates {
  lat: number
  lng: number
}

export interface GlobeVectorConfig {
  radius: number
  surfaceOffset?: number
}

export interface SphericalAngles {
  phi: number
  theta: number
}

export type GeoGeometryType = 'Polygon' | 'MultiPolygon'

export interface LandFeatureProperties {
  id?: string
  name?: string
  continent?: string
  isoA2?: string
  isoA3?: string
  source?: string
}

export type LandConfidence = 'verified' | 'estimated' | 'unknown'

export interface LandCheckResult {
  isOnLand: boolean
  matchedFeatureId?: string
  matchedFeatureName?: string
  confidence: LandConfidence
}

export type CameraTargetMode = 'overview' | 'insect' | 'search-focus' | 'panel-focus'

export interface CameraTarget {
  coordinates: GeoCoordinates
  insectId?: string
  pointId?: string
  mode: CameraTargetMode
  distance: number
  focusStrength?: number
  polarAngle?: number
  azimuthAngle?: number
}
