import { useShallow } from 'zustand/react/shallow'

import { useAppStore } from '@/store/appStore'

export { useAppStore }

export function useFilterState() {
  return useAppStore(
    useShallow((state) => ({
      activeCategory: state.activeCategory,
      setActiveCategory: state.setActiveCategory,
    })),
  )
}

export function useFlightState() {
  return useAppStore(
    useShallow((state) => ({
      isFlying: state.isFlying,
      flightPhase: state.flightPhase,
      setFlyingState: state.setFlyingState,
    })),
  )
}

export function useAppStatus() {
  return useAppStore(
    useShallow((state) => ({
      selectedInsectId: state.selectedInsectId,
      selectedPointId: state.selectedPointId,
      searchKeyword: state.searchKeyword,
      isPanelOpen: state.isPanelOpen,
      sceneReady: state.sceneReady,
      interactionLocked: state.interactionLocked,
      showCountryLabels: state.showCountryLabels,
      lastSelectionOrigin: state.lastSelectionOrigin,
    })),
  )
}

export function useSceneState() {
  return useAppStore(
    useShallow((state) => ({
      sceneReady: state.sceneReady,
      cameraTarget: state.cameraTarget,
      setSceneReady: state.setSceneReady,
    })),
  )
}

export function useAppDebugState() {
  return useAppStore(
    useShallow((state) => ({
      setSelection: state.setSelection,
      setSearchKeyword: state.setSearchKeyword,
      setPanelOpen: state.setPanelOpen,
      setSceneReady: state.setSceneReady,
      setCameraTarget: state.setCameraTarget,
      setInteractionLocked: state.setInteractionLocked,
      setShowCountryLabels: state.setShowCountryLabels,
      resetTransientUi: state.resetTransientUi,
    })),
  )
}
