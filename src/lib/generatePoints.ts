import type { PointsCollection } from './types'

/** Seeded PRNG — measurements in BLOG.md must be reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const DEFAULT_CENTER: [number, number] = [15, 50]

const HOTSPOT_COUNT = 4
const HOTSPOT_SHARE = 0.6
const HOTSPOT_SIGMA = 1.5
const SPREAD_SIGMA = 12

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

/** Box-Muller: two independent standard normal values from two uniforms. */
function normalPair(rng: () => number): [number, number] {
  const u = Math.max(rng(), 1e-12)
  const v = rng()
  const r = Math.sqrt(-2 * Math.log(u))
  return [r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v)]
}

export interface GenerateOptions {
  count: number
  center?: [number, number]
  seed?: number
}

export function generatePoints({ count, center = DEFAULT_CENTER, seed = 42 }: GenerateOptions): PointsCollection {
  const rng = mulberry32(seed)
  const hotspots: [number, number][] = Array.from({ length: HOTSPOT_COUNT }, () => [
    center[0] + (rng() - 0.5) * 30,
    center[1] + (rng() - 0.5) * 16,
  ])

  const features = Array.from({ length: count }, (_, id) => {
    const inHotspot = rng() < HOTSPOT_SHARE
    const [cx, cy] = inHotspot ? hotspots[Math.floor(rng() * HOTSPOT_COUNT)] : center
    const sigma = inHotspot ? HOTSPOT_SIGMA : SPREAD_SIGMA
    const [dx, dy] = normalPair(rng)
    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [clamp(cx + dx * sigma, -180, 180), clamp(cy + dy * sigma * 0.6, -85, 85)],
      },
      properties: { id },
    }
  })

  return { type: 'FeatureCollection', features }
}
