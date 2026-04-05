import '@/app/styles/app-shell.css'

import { EarthScene } from '@/components/earth/EarthScene'
import { CategoryFilterDock } from '@/components/filters'
import { InsectDetailPanel } from '@/components/panels'
import { InsectSearchDock } from '@/components/search'
import { insectCatalogStats } from '@/data/insects'
import {
  useAppDebugState,
  useAppStatus,
  useFlightState,
  useSceneState,
} from '@/hooks/useAppStore'
import { createCameraTargetPreset } from '@/store/appStore'
import { insectCategories } from '@/types'

function App() {
  const { isFlying, flightPhase, setFlyingState } = useFlightState()
  const { sceneReady, cameraTarget } = useSceneState()
  const {
    selectedInsectId,
    selectedPointId,
    isPanelOpen,
    interactionLocked,
    showCountryLabels,
    lastSelectionOrigin,
  } = useAppStatus()
  const {
    setPanelOpen,
    setCameraTarget,
    setInteractionLocked,
    setShowCountryLabels,
    resetTransientUi,
  } = useAppDebugState()

  return (
    <main className="atlas-stage">
      <div className="atlas-stage__backdrop" />
      <EarthScene />

      <div className="hud-layer">
        <header className="title-badge">
          <p className="title-badge__label">Ecological Observation Interface</p>
          <h1>Insect Earth Atlas</h1>
          <p className="title-badge__meta">
            {insectCategories.length} 类昆虫 · {insectCatalogStats.totalInsects} 物种
            · {insectCatalogStats.totalPoints} 数据点 ·{' '}
            {sceneReady ? '场景在线' : '场景加载中'}
          </p>
        </header>

        <aside className="info-stack">
          <section className="glass-card">
            <p className="glass-card__eyebrow">场景状态</p>
            <div className="metric-list">
              <div>
                <span>Stage</span>
                <strong>{sceneReady ? 'Online' : 'Booting'}</strong>
              </div>
              <div>
                <span>Flight</span>
                <strong>{flightPhase}</strong>
              </div>
              <div>
                <span>Lens</span>
                <strong>{cameraTarget?.mode ?? 'overview'}</strong>
              </div>
            </div>
          </section>

          <section className="glass-card">
            <p className="glass-card__eyebrow">当前聚焦</p>
            <div className="metric-list">
              <div>
                <span>Insect</span>
                <strong>{selectedInsectId ?? 'none'}</strong>
              </div>
              <div>
                <span>Point</span>
                <strong>{selectedPointId ?? 'none'}</strong>
              </div>
              <div>
                <span>Origin</span>
                <strong>{lastSelectionOrigin}</strong>
              </div>
            </div>
          </section>
        </aside>

        <aside className="action-rail">
          <button
            type="button"
            className="rail-button rail-button--primary"
            onClick={() =>
              setFlyingState({
                isFlying: !isFlying,
                phase: isFlying ? 'returning' : 'taking-off',
              })
            }
          >
            <span>飞舞模式</span>
            <small>{isFlying ? '归巢收束' : '升空飞舞'}</small>
          </button>

          <button
            type="button"
            className="rail-button"
            onClick={() => setPanelOpen(!isPanelOpen)}
          >
            <span>信息面板</span>
            <small>{isPanelOpen ? '收起面板' : '展开面板'}</small>
          </button>

          <button
            type="button"
            className="rail-button"
            onClick={() => setShowCountryLabels(!showCountryLabels)}
          >
            <span>国家名称</span>
            <small>{showCountryLabels ? '隐藏国家名' : '显示国家名'}</small>
          </button>

          <button
            type="button"
            className="rail-button"
            onClick={() =>
              setCameraTarget(
                createCameraTargetPreset({
                  lat: 34.05,
                  lng: -118.24,
                }),
              )
            }
          >
            <span>视角复位</span>
            <small>返回概览</small>
          </button>

          <button
            type="button"
            className="rail-button"
            onClick={() => setInteractionLocked(!interactionLocked)}
          >
            <span>交互锁定</span>
            <small>{interactionLocked ? '已锁定' : '可交互'}</small>
          </button>

          <button
            type="button"
            className="rail-button"
            onClick={() => resetTransientUi()}
          >
            <span>重置界面</span>
            <small>清理临时状态</small>
          </button>
        </aside>

        <footer className="bottom-dock">
          <InsectSearchDock />
          <CategoryFilterDock />
        </footer>

        <InsectDetailPanel />
      </div>
    </main>
  )
}

export default App
