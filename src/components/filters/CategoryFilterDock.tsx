import { insectCatalogStats, getInsectById } from '@/data/insects'
import { useAppStore } from '@/store/appStore'
import { createCameraTargetPreset } from '@/store/appStore'
import { insectCategories } from '@/types'
import type { InsectFilterCategory } from '@/types'

export function CategoryFilterDock() {
  const activeCategory = useAppStore((state) => state.activeCategory)
  const selectedInsectId = useAppStore((state) => state.selectedInsectId)
  const setActiveCategory = useAppStore((state) => state.setActiveCategory)
  const setSelection = useAppStore((state) => state.setSelection)
  const setPanelOpen = useAppStore((state) => state.setPanelOpen)
  const setCameraTarget = useAppStore((state) => state.setCameraTarget)

  function applyCategory(nextCategory: InsectFilterCategory) {
    setActiveCategory(nextCategory)

    if (nextCategory === 'all') {
      return
    }

    const selectedInsect = getInsectById(selectedInsectId ?? '')

    if (!selectedInsect || selectedInsect.category === nextCategory) {
      return
    }

    // If selected insect is filtered out, clear focus state to keep UI consistent.
    setSelection(null, null, 'filter')
    setPanelOpen(false)
    setCameraTarget(createCameraTargetPreset())
  }

  return (
    <div className="filter-dock">
      <button
        type="button"
        className={
          activeCategory === 'all'
            ? 'filter-chip filter-chip--active'
            : 'filter-chip'
        }
        onClick={() => applyCategory('all')}
      >
        全部 {insectCatalogStats.totalInsects}
      </button>
      {insectCategories.map((category) => (
        <button
          key={category}
          type="button"
          className={
            activeCategory === category
              ? 'filter-chip filter-chip--active'
              : 'filter-chip'
          }
          onClick={() => applyCategory(category)}
        >
          {category === 'butterfly'
            ? `蝴蝶 ${insectCatalogStats.categoryCounts.butterfly}`
            : `蜜蜂 ${insectCatalogStats.categoryCounts.bee}`}
        </button>
      ))}
    </div>
  )
}
