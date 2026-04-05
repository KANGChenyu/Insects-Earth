import type { CameraTarget } from '@/types/geo'
import type { InsectFilterCategory } from '@/types/insect'

export type SelectionOrigin =
  | 'initial'
  | 'scene'
  | 'search'
  | 'filter'
  | 'panel'
  | 'system'

export type FlightPhase = 'grounded' | 'taking-off' | 'airborne' | 'returning'

export interface SearchState {
  keyword: string
  resultIds: string[]
  focusedResultId: string | null
  isOpen: boolean
}

export interface FlightState {
  isFlying: boolean
  phase: FlightPhase
  progress: number
  lastToggleAt: number | null
}

export interface AppState {
  selectedInsectId: string | null
  selectedPointId: string | null
  hoveredInsectId: string | null
  hoveredPointId: string | null
  focusedInsectId: string | null
  activeCategory: InsectFilterCategory
  searchKeyword: string
  cameraTarget: CameraTarget | null
  isPanelOpen: boolean
  isFlying: boolean
  flightPhase: FlightPhase
  searchResultIds: string[]
  focusedSearchResultId: string | null
  sceneReady: boolean
  interactionLocked: boolean
  showCountryLabels: boolean
  lastSelectionOrigin: SelectionOrigin
}

export interface AppActions {
  setSelection: (
    insectId: string | null,
    pointId?: string | null,
    origin?: SelectionOrigin,
  ) => void
  setHoveredTarget: (insectId: string | null, pointId?: string | null) => void
  setActiveCategory: (category: InsectFilterCategory) => void
  setSearchKeyword: (keyword: string) => void
  setSearchResults: (resultIds: string[], focusedResultId?: string | null) => void
  setCameraTarget: (target: CameraTarget | null) => void
  setPanelOpen: (isOpen: boolean) => void
  setFlyingState: (payload: Partial<FlightState>) => void
  setSceneReady: (ready: boolean) => void
  setInteractionLocked: (locked: boolean) => void
  setShowCountryLabels: (show: boolean) => void
  resetTransientUi: () => void
}

export type AppStore = AppState & AppActions
