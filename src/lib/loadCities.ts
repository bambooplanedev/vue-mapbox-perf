import type { PointsCollection } from './types'

let cache: PointsCollection | null = null

/** BASE_URL-safe: an absolute "/data/…" path would 404 on GitHub Pages. */
export async function loadCities(): Promise<PointsCollection> {
  if (cache) return cache
  const res = await fetch(`${import.meta.env.BASE_URL}data/cities.geojson`)
  if (!res.ok) throw new Error(`cities fetch failed: HTTP ${res.status}`)
  cache = (await res.json()) as PointsCollection
  return cache
}
