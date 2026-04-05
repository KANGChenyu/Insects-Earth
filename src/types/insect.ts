import type { GeoCoordinates, LandCheckResult } from '@/types/geo'

export const insectCategories = ['butterfly', 'bee'] as const
export const bioRegionKeys = [
  'north-america',
  'south-america',
  'europe',
  'africa',
  'asia',
  'oceania',
  'antarctica',
] as const

export type InsectCategory = (typeof insectCategories)[number]
export type InsectFilterCategory = InsectCategory | 'all'
export type BioRegionKey = (typeof bioRegionKeys)[number]

export interface InsectMediaAsset {
  id: string
  src: string
  alt: string
  credit?: string
  license?: string
  width?: number
  height?: number
  dominantColor?: string
}

export interface InsectSource {
  id: string
  title: string
  url: string
  publisher?: string
  accessedAt?: string
  note?: string
}

export interface InsectTaxonomy {
  order: string
  family: string
  genus: string
  species?: string
  kingdom?: string
  phylum?: string
  className?: string
}

export interface InsectPoint extends GeoCoordinates {
  id: string
  region: string
  country: string
  locality?: string
  weight: number
  verifiedOnLand: boolean
  landCheck?: LandCheckResult
  homeAltitude?: number
  habitatLabel?: string
}

export interface InsectPalette {
  primary: string
  secondary: string
  accent: string
}

export interface InsectRange {
  min: number
  max: number
  unit: string
}

export interface Insect {
  id: string
  slug: string
  category: InsectCategory
  commonNameZh: string
  commonNameEn: string
  scientificName: string
  family: string
  genus: string
  taxonomy: InsectTaxonomy
  description: string
  habitat: string
  distributionText: string
  ecology: string
  pollinationRole: string
  nativeRegions: BioRegionKey[]
  tags: string[]
  heroImage: InsectMediaAsset
  gallery: InsectMediaAsset[]
  sources: InsectSource[]
  license: string
  points: InsectPoint[]
  conservationStatus?: string
  activityPeriod?: string
  wingSpan?: InsectRange
  palette?: InsectPalette
  featured?: boolean
}
