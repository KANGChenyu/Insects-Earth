export interface EarthTextureManifest {
  albedoUrl: string | null
  normalUrl: string | null
  oceanMaskUrl: string | null
  cloudUrl: string | null
}

// Real texture URLs will be plugged in here later without changing scene code.
export const earthTextureManifest: EarthTextureManifest = {
  albedoUrl: '/earth/earth_albedo_2048.jpg',
  normalUrl: '/earth/earth_normal_2048.jpg',
  oceanMaskUrl: '/earth/earth_roughness_2048.jpg',
  cloudUrl: '/earth/earth_clouds_4096.png',
}
