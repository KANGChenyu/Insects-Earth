export type GlobeLabelTier = 'continent' | 'ocean' | 'country'

export interface GlobeLabelEntry {
  id: string
  text: string
  lat: number
  lng: number
  tier: GlobeLabelTier
  rotationDeg?: number
}

export const globeLabels: GlobeLabelEntry[] = [
  { id: 'cont-na', text: 'NORTH AMERICA', lat: 50, lng: -104, tier: 'continent' },
  { id: 'cont-sa', text: 'SOUTH AMERICA', lat: -20, lng: -60, tier: 'continent' },
  { id: 'cont-eu', text: 'EUROPE', lat: 53, lng: 16, tier: 'continent' },
  { id: 'cont-af', text: 'AFRICA', lat: 7, lng: 20, tier: 'continent' },
  { id: 'cont-as', text: 'ASIA', lat: 38, lng: 90, tier: 'continent' },
  { id: 'cont-oc', text: 'OCEANIA', lat: -24, lng: 136, tier: 'continent' },
  { id: 'cont-an', text: 'ANTARCTICA', lat: -77, lng: 0, tier: 'continent' },

  { id: 'ocean-arctic', text: 'ARCTIC OCEAN', lat: 73, lng: 0, tier: 'ocean' },
  { id: 'ocean-atlantic-n', text: 'ATLANTIC OCEAN', lat: 24, lng: -35, tier: 'ocean' },
  { id: 'ocean-atlantic-s', text: 'ATLANTIC OCEAN', lat: -27, lng: -16, tier: 'ocean' },
  { id: 'ocean-pacific-n', text: 'PACIFIC OCEAN', lat: 19, lng: -151, tier: 'ocean' },
  { id: 'ocean-pacific-s', text: 'PACIFIC OCEAN', lat: -22, lng: -130, tier: 'ocean' },
  { id: 'ocean-indian', text: 'INDIAN OCEAN', lat: -22, lng: 82, tier: 'ocean' },
  { id: 'ocean-southern', text: 'SOUTHERN OCEAN', lat: -57, lng: 35, tier: 'ocean' },

  { id: 'country-canada', text: 'Canada', lat: 60, lng: -99, tier: 'country' },
  { id: 'country-united-states', text: 'United States', lat: 38, lng: -98, tier: 'country' },
  { id: 'country-mexico', text: 'Mexico', lat: 23, lng: -102, tier: 'country' },
  { id: 'country-brazil', text: 'Brazil', lat: -10, lng: -53, tier: 'country' },
  { id: 'country-argentina', text: 'Argentina', lat: -36, lng: -64, tier: 'country' },
  { id: 'country-chile', text: 'Chile', lat: -33, lng: -70, tier: 'country' },
  { id: 'country-colombia', text: 'Colombia', lat: 4, lng: -74, tier: 'country' },
  { id: 'country-peru', text: 'Peru', lat: -10, lng: -75, tier: 'country' },

  { id: 'country-uk', text: 'United Kingdom', lat: 54, lng: -2, tier: 'country' },
  { id: 'country-france', text: 'France', lat: 46, lng: 2, tier: 'country' },
  { id: 'country-spain', text: 'Spain', lat: 40, lng: -3, tier: 'country' },
  { id: 'country-germany', text: 'Germany', lat: 51, lng: 10, tier: 'country' },
  { id: 'country-italy', text: 'Italy', lat: 42, lng: 12, tier: 'country' },
  { id: 'country-norway', text: 'Norway', lat: 63, lng: 11, tier: 'country' },
  { id: 'country-sweden', text: 'Sweden', lat: 62, lng: 16, tier: 'country' },
  { id: 'country-poland', text: 'Poland', lat: 52, lng: 19, tier: 'country' },
  { id: 'country-ukraine', text: 'Ukraine', lat: 49, lng: 32, tier: 'country' },
  { id: 'country-russia', text: 'Russia', lat: 61, lng: 96, tier: 'country' },
  { id: 'country-turkey', text: 'Turkey', lat: 39, lng: 35, tier: 'country' },

  { id: 'country-morocco', text: 'Morocco', lat: 31, lng: -6, tier: 'country' },
  { id: 'country-algeria', text: 'Algeria', lat: 28, lng: 2, tier: 'country' },
  { id: 'country-egypt', text: 'Egypt', lat: 27, lng: 30, tier: 'country' },
  { id: 'country-nigeria', text: 'Nigeria', lat: 9, lng: 8, tier: 'country' },
  { id: 'country-ethiopia', text: 'Ethiopia', lat: 9, lng: 40, tier: 'country' },
  { id: 'country-kenya', text: 'Kenya', lat: 0.5, lng: 37, tier: 'country' },
  { id: 'country-south-africa', text: 'South Africa', lat: -29, lng: 24, tier: 'country' },
  { id: 'country-madagascar', text: 'Madagascar', lat: -19, lng: 47, tier: 'country' },

  { id: 'country-saudi-arabia', text: 'Saudi Arabia', lat: 23, lng: 45, tier: 'country' },
  { id: 'country-iran', text: 'Iran', lat: 32, lng: 54, tier: 'country' },
  { id: 'country-kazakhstan', text: 'Kazakhstan', lat: 48, lng: 67, tier: 'country' },
  { id: 'country-india', text: 'India', lat: 22, lng: 79, tier: 'country' },
  { id: 'country-pakistan', text: 'Pakistan', lat: 30, lng: 70, tier: 'country' },
  { id: 'country-china', text: 'China', lat: 35, lng: 104, tier: 'country' },
  { id: 'country-mongolia', text: 'Mongolia', lat: 46, lng: 104, tier: 'country' },
  { id: 'country-thailand', text: 'Thailand', lat: 15, lng: 101, tier: 'country' },
  { id: 'country-vietnam', text: 'Vietnam', lat: 16, lng: 107, tier: 'country' },
  { id: 'country-indonesia', text: 'Indonesia', lat: -2, lng: 118, tier: 'country' },
  { id: 'country-philippines', text: 'Philippines', lat: 13, lng: 122, tier: 'country' },
  { id: 'country-japan', text: 'Japan', lat: 37, lng: 138, tier: 'country' },
  { id: 'country-korea', text: 'South Korea', lat: 36, lng: 128, tier: 'country' },

  { id: 'country-australia', text: 'Australia', lat: -25, lng: 134, tier: 'country' },
  { id: 'country-new-zealand', text: 'New Zealand', lat: -41, lng: 173, tier: 'country' },
]
