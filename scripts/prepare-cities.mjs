// One-off preprocessing: Natural Earth populated places (1:10m — the only
// resolution with ~7k points) trimmed from ~30 attributes down to three.
// Usage: npm run prepare-cities
import { mkdir, writeFile } from 'node:fs/promises'

const SRC =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places_simple.geojson'

const res = await fetch(SRC)
if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`)
const raw = await res.json()

const features = raw.features
  .filter((f) => f.geometry?.type === 'Point' && f.properties?.name)
  .map((f) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: f.geometry.coordinates.map((c) => Number(c.toFixed(4))) },
    properties: {
      name: f.properties.name,
      country: f.properties.adm0name ?? '',
      population: Number(f.properties.pop_max) || 0,
    },
  }))

const out = { type: 'FeatureCollection', features }
await mkdir('public/data', { recursive: true })
await writeFile('public/data/cities.geojson', JSON.stringify(out))
console.log(`wrote ${features.length} cities, ${(JSON.stringify(out).length / 1024).toFixed(0)} KiB`)
