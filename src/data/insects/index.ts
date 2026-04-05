import type { Insect, InsectCategory, InsectFilterCategory } from '@/types'

import { mockInsects } from './mockInsects'
import { landValidationSummary, validatedMockInsects } from './validatedMockInsects'

export * from './projectedMockPoints'

export interface InsectCatalogStats {
  totalInsects: number
  totalPoints: number
  categoryCounts: Record<InsectCategory, number>
}

export const rawInsectCatalog: Insect[] = mockInsects
export const insectCatalog: Insect[] = validatedMockInsects
export { landValidationSummary }

export const insectCatalogStats: InsectCatalogStats = {
  totalInsects: insectCatalog.length,
  totalPoints: insectCatalog.reduce(
    (count, insect) => count + insect.points.length,
    0,
  ),
  categoryCounts: {
    butterfly: insectCatalog.filter((insect) => insect.category === 'butterfly')
      .length,
    bee: insectCatalog.filter((insect) => insect.category === 'bee').length,
  },
}

export function getInsectById(insectId: string) {
  return insectCatalog.find((insect) => insect.id === insectId) ?? null
}

export function getInsectsByCategory(category: InsectFilterCategory) {
  if (category === 'all') {
    return insectCatalog
  }

  return insectCatalog.filter((insect) => insect.category === category)
}

export function getAllInsectPoints() {
  return insectCatalog.flatMap((insect) => insect.points)
}
