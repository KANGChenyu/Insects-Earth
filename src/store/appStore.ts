import { create } from 'zustand'

import type {
  AppState,
  AppStore,
  CameraTarget,
  FlightState,
  InsectFilterCategory,
  SelectionOrigin,
} from '@/types'

const OVERVIEW_CAMERA_DISTANCE = 4.6

export function createCameraTargetPreset(
  coordinates = { lat: 18, lng: 12 },
): CameraTarget {
  return {
    coordinates,
    distance: OVERVIEW_CAMERA_DISTANCE,
    mode: 'overview',
    focusStrength: 0.45,
    polarAngle: 1.25,
    azimuthAngle: 0.35,
  }
}

export const initialAppState: AppState = {
  selectedInsectId: null,
  selectedPointId: null,
  hoveredInsectId: null,
  hoveredPointId: null,
  focusedInsectId: null,
  activeCategory: 'all',
  searchKeyword: '',
  cameraTarget: createCameraTargetPreset(),
  isPanelOpen: false,
  isFlying: false,
  flightPhase: 'grounded',
  searchResultIds: [],
  focusedSearchResultId: null,
  sceneReady: false,
  interactionLocked: false,
  showCountryLabels: false,
  lastSelectionOrigin: 'initial',
}

function sanitizeSelectionOrigin(origin?: SelectionOrigin): SelectionOrigin {
  return origin ?? 'system'
}

function sanitizeCategory(category: InsectFilterCategory): InsectFilterCategory {
  return category
}

function mergeFlightState(
  currentState: AppState,
  payload: Partial<FlightState>,
): Pick<AppState, 'isFlying' | 'flightPhase'> {
  const nextIsFlying = payload.isFlying ?? currentState.isFlying
  const nextPhase =
    payload.phase ?? (nextIsFlying ? currentState.flightPhase : 'grounded')

  return {
    isFlying: nextIsFlying,
    flightPhase: nextPhase,
  }
}

export const useAppStore = create<AppStore>()((set) => ({
  ...initialAppState,

  setSelection: (insectId, pointId = null, origin = 'system') => {
    set(() => ({
      selectedInsectId: insectId,
      selectedPointId: pointId,
      focusedInsectId: insectId,
      isPanelOpen: Boolean(insectId),
      lastSelectionOrigin: sanitizeSelectionOrigin(origin),
    }))
  },

  setHoveredTarget: (insectId, pointId = null) => {
    set(() => ({
      hoveredInsectId: insectId,
      hoveredPointId: pointId,
    }))
  },

  setActiveCategory: (category) => {
    set((state) => ({
      activeCategory: sanitizeCategory(category),
      lastSelectionOrigin: 'filter',
      focusedSearchResultId:
        state.activeCategory === category ? state.focusedSearchResultId : null,
    }))
  },

  setSearchKeyword: (keyword) => {
    set(() => ({
      searchKeyword: keyword,
    }))
  },

  setSearchResults: (resultIds, focusedResultId = null) => {
    set(() => ({
      searchResultIds: resultIds,
      focusedSearchResultId: focusedResultId,
    }))
  },

  setCameraTarget: (target) => {
    set(() => ({
      cameraTarget: target,
    }))
  },

  setPanelOpen: (isOpen) => {
    set(() => ({
      isPanelOpen: isOpen,
    }))
  },

  setFlyingState: (payload) => {
    set((state) => mergeFlightState(state, payload))
  },

  setSceneReady: (ready) => {
    set(() => ({
      sceneReady: ready,
    }))
  },

  setInteractionLocked: (locked) => {
    set(() => ({
      interactionLocked: locked,
    }))
  },

  setShowCountryLabels: (show) => {
    set(() => ({
      showCountryLabels: show,
    }))
  },

  resetTransientUi: () => {
    set((state) => ({
      hoveredInsectId: null,
      hoveredPointId: null,
      focusedSearchResultId: null,
      interactionLocked: false,
      searchKeyword: '',
      searchResultIds: [],
      cameraTarget: state.selectedInsectId
        ? state.cameraTarget
        : createCameraTargetPreset(),
    }))
  },
}))
