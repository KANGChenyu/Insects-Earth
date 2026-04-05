import { startTransition, useDeferredValue, useEffect, useMemo } from 'react'

import { insectCatalog } from '@/data/insects'
import { getFirstGridCellByInsectId } from '@/data/insects/gridInsectCells'
import { useAppStore } from '@/store/appStore'
import { createInsectSearchIndex } from '@/utils/search'

function toCategoryLabel(category: 'butterfly' | 'bee') {
  return category === 'bee' ? '蜜蜂' : '蝴蝶'
}

export function InsectSearchDock() {
  const activeCategory = useAppStore((state) => state.activeCategory)
  const searchKeyword = useAppStore((state) => state.searchKeyword)
  const searchResultIds = useAppStore((state) => state.searchResultIds)
  const focusedSearchResultId = useAppStore(
    (state) => state.focusedSearchResultId,
  )
  const setSearchKeyword = useAppStore((state) => state.setSearchKeyword)
  const setSearchResults = useAppStore((state) => state.setSearchResults)
  const setSelection = useAppStore((state) => state.setSelection)
  const setPanelOpen = useAppStore((state) => state.setPanelOpen)
  const setCameraTarget = useAppStore((state) => state.setCameraTarget)

  const insectsById = useMemo(
    () => new Map(insectCatalog.map((insect) => [insect.id, insect])),
    [],
  )
  const searchIndex = useMemo(() => createInsectSearchIndex(insectCatalog), [])
  const deferredKeyword = useDeferredValue(searchKeyword)
  const searchHits = useMemo(
    () => searchIndex.search(deferredKeyword, 8),
    [deferredKeyword, searchIndex],
  )
  const scopedSearchHits = useMemo(
    () =>
      activeCategory === 'all'
        ? searchHits
        : searchHits.filter((hit) => hit.category === activeCategory),
    [activeCategory, searchHits],
  )

  useEffect(() => {
    const nextIds = scopedSearchHits.map((hit) => hit.insectId)
    const focusedId = nextIds[0] ?? null
    setSearchResults(nextIds, focusedId)
  }, [scopedSearchHits, setSearchResults])

  const visibleResults = useMemo(
    () =>
      searchResultIds
        .map((resultId) => insectsById.get(resultId))
        .filter((insect): insect is NonNullable<typeof insect> => Boolean(insect)),
    [insectsById, searchResultIds],
  )

  function locateInsect(insectId: string) {
    const targetCell = getFirstGridCellByInsectId(insectId)

    if (!targetCell) {
      return
    }

    setSelection(insectId, targetCell.id, 'search')
    setPanelOpen(true)
    setCameraTarget({
      coordinates: { lat: targetCell.lat, lng: targetCell.lng },
      insectId,
      pointId: targetCell.id,
      mode: 'search-focus',
      distance: 3.22,
      focusStrength: 0.94,
      polarAngle: 1.02,
      azimuthAngle: 0.18,
    })
    setSearchResults(searchResultIds, insectId)
  }

  return (
    <div className="search-dock">
      <label className="search-dock__label" htmlFor="atlas-search">
        物种搜索
      </label>
      <input
        id="atlas-search"
        value={searchKeyword}
        onChange={(event) => {
          const keyword = event.target.value
          startTransition(() => {
            setSearchKeyword(keyword)
          })
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && searchResultIds.length > 0) {
            const targetId = focusedSearchResultId ?? searchResultIds[0]
            locateInsect(targetId)
          }
        }}
        placeholder="输入中文名、英文名、学名、标签或分类"
      />
      <button
        type="button"
        className="search-dock__action"
        onClick={() => {
          const targetId = focusedSearchResultId ?? searchResultIds[0]
          if (!targetId) {
            return
          }
          locateInsect(targetId)
        }}
      >
        搜索定位
      </button>

      {searchKeyword.trim().length > 0 && (
        <div className="search-results">
          {visibleResults.length === 0 && (
            <p className="search-results__empty">
              当前分类下未命中结果，请尝试切换分类或更换关键词。
            </p>
          )}

          {visibleResults.map((insect) => (
            <button
              key={insect.id}
              type="button"
              className={
                focusedSearchResultId === insect.id
                  ? 'search-result search-result--active'
                  : 'search-result'
              }
              onClick={() => locateInsect(insect.id)}
            >
              <strong>
                {insect.commonNameZh} · {insect.commonNameEn}
              </strong>
              <span>
                {toCategoryLabel(insect.category)} · {insect.scientificName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
