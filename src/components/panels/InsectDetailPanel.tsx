import { useMemo } from 'react'

import { insectCatalog } from '@/data/insects'
import { getGridInsectCellById } from '@/data/insects/gridInsectCells'
import { createCameraTargetPreset, useAppStore } from '@/store/appStore'
import type { BioRegionKey, Insect } from '@/types'

function toTagLine(tags: string[]) {
  return tags.slice(0, 5).join(' / ')
}

function toCategoryLabelZh(category: Insect['category']) {
  return category === 'bee' ? '蜜蜂' : '蝴蝶'
}

function toRegionLabelZh(region: BioRegionKey) {
  const regionMap: Record<BioRegionKey, string> = {
    'north-america': '北美洲',
    'south-america': '南美洲',
    europe: '欧洲',
    africa: '非洲',
    asia: '亚洲',
    oceania: '大洋洲',
    antarctica: '南极洲',
  }

  return regionMap[region]
}

function buildDistributionZh(insect: Insect, countryText?: string) {
  const regions = insect.nativeRegions.map(toRegionLabelZh).join('、')
  const country = countryText ? `，典型国家/地区包括 ${countryText}` : ''

  return `主要分布于${regions}${country}。`
}

function buildPopularScienceZh(insect: Insect) {
  const categoryZh = toCategoryLabelZh(insect.category)
  const regions = insect.nativeRegions.map(toRegionLabelZh).join('、')

  if (insect.category === 'bee') {
    return `${insect.commonNameZh}属于${categoryZh}类昆虫，主要见于${regions}。它在当地植物传粉网络中作用显著，对维持生态系统稳定和农业授粉都有重要意义。`
  }

  return `${insect.commonNameZh}属于${categoryZh}类昆虫，主要见于${regions}。其成虫取食花蜜并参与传粉，同时也是食物网中的关键环节，对区域生物多样性具有重要价值。`
}

export function InsectDetailPanel() {
  const selectedInsectId = useAppStore((state) => state.selectedInsectId)
  const selectedPointId = useAppStore((state) => state.selectedPointId)
  const isPanelOpen = useAppStore((state) => state.isPanelOpen)
  const setPanelOpen = useAppStore((state) => state.setPanelOpen)
  const setSelection = useAppStore((state) => state.setSelection)
  const setCameraTarget = useAppStore((state) => state.setCameraTarget)

  const selectedInsect = useMemo(
    () => insectCatalog.find((insect) => insect.id === selectedInsectId) ?? null,
    [selectedInsectId],
  )
  const selectedGridCell = useMemo(
    () => getGridInsectCellById(selectedPointId),
    [selectedPointId],
  )

  if (!isPanelOpen || !selectedInsect) {
    return null
  }

  const distributionZh = buildDistributionZh(
    selectedInsect,
    selectedGridCell?.country ?? selectedInsect.points[0]?.country,
  )
  const popularScienceZh = buildPopularScienceZh(selectedInsect)

  return (
    <aside className="insect-panel" aria-label="昆虫详情面板">
      <button
        type="button"
        className="insect-panel__close"
        onClick={() => {
          setPanelOpen(false)
          setSelection(null, null, 'panel')
          setCameraTarget(createCameraTargetPreset())
        }}
      >
        关闭
      </button>

      <div className="insect-panel__hero-wrap">
        <img
          src={selectedInsect.heroImage.src}
          alt={selectedInsect.heroImage.alt}
          className="insect-panel__hero"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src =
              selectedInsect.category === 'bee'
                ? '/insects/bee-marker.svg'
                : '/insects/butterfly-marker.svg'
          }}
        />
      </div>

      <section className="insect-panel__section">
        <p className="insect-panel__label">名称</p>
        <h3>{selectedInsect.commonNameZh}</h3>
        <p className="insect-panel__sub">英文名：{selectedInsect.commonNameEn}</p>
        <p className="insect-panel__sub">学名：{selectedInsect.scientificName}</p>
      </section>

      <section className="insect-panel__section">
        <p className="insect-panel__label">分类信息</p>
        <p>
          {selectedInsect.taxonomy.order} / {selectedInsect.family} /{' '}
          {selectedInsect.genus}
        </p>
      </section>

      <section className="insect-panel__section">
        <p className="insect-panel__label">分布信息</p>
        <p>{distributionZh}</p>
        <p>英文原始分布：{selectedInsect.distributionText}</p>
        <p>生境：{selectedInsect.habitat}</p>
        {selectedGridCell && (
          <p>
            当前聚焦网格：{selectedGridCell.lat.toFixed(2)}°，{' '}
            {selectedGridCell.lng.toFixed(2)}° · {selectedGridCell.country}
          </p>
        )}
      </section>

      <section className="insect-panel__section">
        <p className="insect-panel__label">科普描述（中文）</p>
        <p>{popularScienceZh}</p>
      </section>

      <footer className="insect-panel__footer">
        <span>{toCategoryLabelZh(selectedInsect.category)}</span>
        <span>{toTagLine(selectedInsect.tags)}</span>
      </footer>
    </aside>
  )
}
