import Fuse, { type IFuseOptions } from 'fuse.js'

import type { Insect } from '@/types'

export interface InsectSearchEntry {
  insectId: string
  commonNameZh: string
  commonNameEn: string
  scientificName: string
  category: Insect['category']
  categoryLabelZh: string
  family: string
  genus: string
  order: string
  tags: string[]
}

export interface InsectSearchHit extends InsectSearchEntry {
  score: number
}

interface InsectSearchIndex {
  search: (keyword: string, limit?: number) => InsectSearchHit[]
  entries: InsectSearchEntry[]
}

function toCategoryLabelZh(category: Insect['category']) {
  return category === 'bee' ? '蜜蜂' : '蝴蝶'
}

const SEARCH_OPTIONS: IFuseOptions<InsectSearchEntry> = {
  includeScore: true,
  threshold: 0.34,
  ignoreLocation: true,
  minMatchCharLength: 1,
  keys: [
    { name: 'commonNameZh', weight: 0.32 },
    { name: 'commonNameEn', weight: 0.28 },
    { name: 'scientificName', weight: 0.22 },
    { name: 'tags', weight: 0.2 },
    { name: 'categoryLabelZh', weight: 0.16 },
    { name: 'category', weight: 0.16 },
    { name: 'family', weight: 0.12 },
    { name: 'genus', weight: 0.12 },
    { name: 'order', weight: 0.1 },
  ],
}

export function createInsectSearchIndex(insects: Insect[]): InsectSearchIndex {
  const entries: InsectSearchEntry[] = insects.map((insect) => ({
    insectId: insect.id,
    commonNameZh: insect.commonNameZh,
    commonNameEn: insect.commonNameEn,
    scientificName: insect.scientificName,
    category: insect.category,
    categoryLabelZh: toCategoryLabelZh(insect.category),
    family: insect.family,
    genus: insect.genus,
    order: insect.taxonomy.order,
    tags: insect.tags,
  }))

  const fuse = new Fuse(entries, SEARCH_OPTIONS)

  return {
    entries,
    search: (keyword: string, limit = 8) => {
      const normalizedKeyword = keyword.trim()

      if (!normalizedKeyword) {
        return []
      }

      return fuse.search(normalizedKeyword, { limit }).map((result) => ({
        ...result.item,
        score: result.score ?? 0,
      }))
    },
  }
}
