export interface BlueprintSection {
  title: string
  description: string
  items: string[]
}

export const directoryBlueprint: BlueprintSection[] = [
  {
    title: 'app',
    description:
      'Application entry, app-wide styles, and future provider composition.',
    items: ['App.tsx', 'styles/', 'providers/'],
  },
  {
    title: 'components',
    description:
      'UI-facing view layer split by concern instead of one oversized scene file.',
    items: ['earth/', 'insects/', 'panels/', 'search/', 'filters/', 'ui/'],
  },
  {
    title: 'data',
    description:
      'Mock insects, land GeoJSON, and future API adapters or import pipelines.',
    items: ['insects/', 'geo/'],
  },
  {
    title: 'store + hooks',
    description:
      'Shared app state, selectors, and scene-aware hooks for camera or flight systems.',
    items: ['store/', 'hooks/'],
  },
  {
    title: 'systems + utils',
    description:
      'Pure logic for placement, search, animation and globe math, independent from React UI.',
    items: ['systems/', 'utils/animation/', 'utils/geo/', 'utils/math/', 'utils/search/'],
  },
  {
    title: 'types + assets + shaders',
    description:
      'Stable contracts for data exchange, texture resources and future visual effects.',
    items: ['types/', 'assets/earth/', 'assets/insects/', 'shaders/'],
  },
]
