import { landGeoJson } from '@/data/geo'
import { validateInsectsOnLand } from '@/utils/geo'

import { mockInsects } from './mockInsects'

const landValidationResult = validateInsectsOnLand(mockInsects, landGeoJson, {
  dropOceanPoints: true,
})

export const validatedMockInsects = landValidationResult.insects
export const landValidationSummary = landValidationResult.summary
