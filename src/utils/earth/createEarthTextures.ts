import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

import { earthTextureManifest } from '@/assets/earth/earthTextureManifest'

export interface EarthTextureSet {
  albedo: CanvasTexture
  bump: CanvasTexture
  roughness: CanvasTexture
  clouds: CanvasTexture
}

interface Palette {
  oceanDeep: string
  oceanShallow: string
  landPrimary: string
  landSecondary: string
  ridge: string
  cloud: string
}

const TEXTURE_WIDTH = 2048
const TEXTURE_HEIGHT = 1024

const palette: Palette = {
  oceanDeep: '#0e2e5d',
  oceanShallow: '#1d5ea6',
  landPrimary: '#6b7d47',
  landSecondary: '#9a9d67',
  ridge: '#d7d3c1',
  cloud: 'rgba(245, 249, 255, 0.92)',
}

const LAND_SHAPES = [
  [
    [0.08, 0.2],
    [0.16, 0.12],
    [0.22, 0.18],
    [0.2, 0.34],
    [0.15, 0.48],
    [0.11, 0.72],
    [0.16, 0.88],
    [0.08, 0.95],
    [0.03, 0.84],
    [0.04, 0.62],
    [0.02, 0.42],
  ],
  [
    [0.34, 0.16],
    [0.52, 0.1],
    [0.7, 0.2],
    [0.8, 0.3],
    [0.86, 0.44],
    [0.84, 0.64],
    [0.7, 0.82],
    [0.54, 0.78],
    [0.46, 0.66],
    [0.38, 0.56],
    [0.33, 0.38],
  ],
  [
    [0.72, 0.72],
    [0.82, 0.68],
    [0.92, 0.76],
    [0.9, 0.92],
    [0.8, 0.96],
    [0.74, 0.88],
  ],
]

function createCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = TEXTURE_WIDTH
  canvas.height = TEXTURE_HEIGHT

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Unable to create 2D canvas context for Earth textures.')
  }

  return { canvas, context }
}

function drawClosedPath(
  context: CanvasRenderingContext2D,
  points: number[][],
  offsetX = 0,
) {
  context.beginPath()
  points.forEach(([x, y], index) => {
    const drawX = x * TEXTURE_WIDTH + offsetX
    const drawY = y * TEXTURE_HEIGHT

    if (index === 0) {
      context.moveTo(drawX, drawY)
      return
    }

    context.lineTo(drawX, drawY)
  })
  context.closePath()
}

function paintOcean(context: CanvasRenderingContext2D) {
  const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT)
  gradient.addColorStop(0, '#2b6cb6')
  gradient.addColorStop(0.5, palette.oceanDeep)
  gradient.addColorStop(1, '#0a1f42')

  context.fillStyle = gradient
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)

  for (let index = 0; index < 14; index += 1) {
    context.fillStyle = `rgba(215, 239, 255, ${0.012 + index * 0.0015})`
    context.fillRect(
      0,
      (TEXTURE_HEIGHT / 14) * index,
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT / 18,
    )
  }
}

function paintLand(
  context: CanvasRenderingContext2D,
  fillStyle: string,
  shadowStyle: string,
) {
  const offsets = [0, TEXTURE_WIDTH]

  offsets.forEach((offsetX) => {
    LAND_SHAPES.forEach((shape) => {
      drawClosedPath(context, shape, offsetX)

      context.fillStyle = fillStyle
      context.fill()

      context.strokeStyle = shadowStyle
      context.lineWidth = 16
      context.stroke()
    })
  })
}

function createAlbedoTexture() {
  const { canvas, context } = createCanvas()

  paintOcean(context)
  paintLand(context, palette.landPrimary, 'rgba(9, 34, 20, 0.42)')

  context.globalAlpha = 0.35
  paintLand(context, palette.landSecondary, 'rgba(226, 255, 188, 0.12)')
  context.globalAlpha = 1

  context.strokeStyle = palette.ridge
  context.lineWidth = 5
  context.globalAlpha = 0.4
  context.beginPath()
  context.moveTo(TEXTURE_WIDTH * 0.38, TEXTURE_HEIGHT * 0.23)
  context.lineTo(TEXTURE_WIDTH * 0.53, TEXTURE_HEIGHT * 0.38)
  context.lineTo(TEXTURE_WIDTH * 0.64, TEXTURE_HEIGHT * 0.52)
  context.stroke()
  context.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.needsUpdate = true

  return texture
}

function createBumpTexture() {
  const { canvas, context } = createCanvas()

  context.fillStyle = '#242424'
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
  paintLand(context, '#8d8d8d', '#d4d4d4')

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.needsUpdate = true

  return texture
}

function createRoughnessTexture() {
  const { canvas, context } = createCanvas()

  context.fillStyle = '#595959'
  context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
  paintLand(context, '#bdbdbd', '#ffffff')

  const texture = new CanvasTexture(canvas)
  texture.wrapS = RepeatWrapping
  texture.needsUpdate = true

  return texture
}

function createCloudTexture() {
  const { canvas, context } = createCanvas()

  context.clearRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
  context.fillStyle = palette.cloud
  context.globalAlpha = 0.22

  const clouds = [
    [0.18, 0.24, 180, 54],
    [0.36, 0.18, 220, 66],
    [0.57, 0.34, 200, 58],
    [0.72, 0.52, 240, 70],
    [0.42, 0.68, 260, 74],
    [0.86, 0.28, 160, 48],
  ]

  clouds.forEach(([x, y, width, height]) => {
    context.beginPath()
    context.ellipse(
      x * TEXTURE_WIDTH,
      y * TEXTURE_HEIGHT,
      width,
      height,
      Math.PI / 7,
      0,
      Math.PI * 2,
    )
    context.fill()
  })

  context.globalAlpha = 1

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.needsUpdate = true

  return texture
}

export function createEarthTextureSet(): EarthTextureSet {
  // The manifest is the future handoff point for real satellite textures.
  void earthTextureManifest

  return {
    albedo: createAlbedoTexture(),
    bump: createBumpTexture(),
    roughness: createRoughnessTexture(),
    clouds: createCloudTexture(),
  }
}
