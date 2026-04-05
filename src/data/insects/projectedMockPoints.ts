import { projectInsectPoints } from '@/utils/geo'

import { validatedMockInsects } from './validatedMockInsects'

export const CURRENT_GLOBE_RADIUS = 1.68
export const CURRENT_MARKER_SURFACE_OFFSET = 0.032

export const projectedMockPoints = projectInsectPoints(validatedMockInsects, {
  radius: CURRENT_GLOBE_RADIUS,
  surfaceOffset: CURRENT_MARKER_SURFACE_OFFSET,
})
