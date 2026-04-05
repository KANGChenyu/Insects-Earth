import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson'

import type { LandFeatureProperties } from '@/types'

import landGeoJsonRaw from './land.geo.json'

export type LandGeoCollection = FeatureCollection<
  Polygon | MultiPolygon,
  LandFeatureProperties
>

// Natural Earth 110m land polygons (public domain, simplified for web).
export const landGeoJson = landGeoJsonRaw as unknown as LandGeoCollection

export const LAND_DATASET_META = {
  id: 'natural-earth-ne_110m_land',
  name: 'Natural Earth 1:110m Land',
  source: 'https://www.naturalearthdata.com/',
  featureCount: landGeoJson.features.length,
} as const
