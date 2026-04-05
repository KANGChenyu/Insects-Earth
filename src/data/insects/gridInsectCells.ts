import { landGeoJson } from '@/data/geo'
import {
  CURRENT_GLOBE_RADIUS,
  CURRENT_MARKER_SURFACE_OFFSET,
} from '@/data/insects/projectedMockPoints'
import { validatedMockInsects } from '@/data/insects/validatedMockInsects'
import { buildLandGridCells } from '@/utils/geo/landGrid'

export const GRID_LAT_STEP = 2.45
export const GRID_LNG_STEP = 2.45
export const GRID_MAX_CELLS = 100000
export const GRID_LINE_OFFSET = 0.012
export const GRID_MARKER_SCALE = 0.34

export const gridInsectCells = buildLandGridCells(validatedMockInsects, landGeoJson, {
  latStep: GRID_LAT_STEP,
  lngStep: GRID_LNG_STEP,
  maxCells: GRID_MAX_CELLS,
  markerPlacement: {
    radius: CURRENT_GLOBE_RADIUS,
    surfaceOffset: CURRENT_MARKER_SURFACE_OFFSET,
  },
  gridPlacement: {
    radius: CURRENT_GLOBE_RADIUS,
    surfaceOffset: GRID_LINE_OFFSET,
  },
})

export const gridInsectCellMap = new Map(
  gridInsectCells.map((cell) => [cell.id, cell] as const),
)

export const firstGridCellByInsectId = new Map(
  validatedMockInsects.map((insect) => {
    const cell =
      gridInsectCells.find((gridCell) => gridCell.insectId === insect.id) ?? null

    return [insect.id, cell] as const
  }),
)

export function getGridInsectCellById(cellId: string | null) {
  if (!cellId) {
    return null
  }

  return gridInsectCellMap.get(cellId) ?? null
}

export function getFirstGridCellByInsectId(insectId: string | null) {
  if (!insectId) {
    return null
  }

  return firstGridCellByInsectId.get(insectId) ?? null
}
