import { onUnmounted, type ShallowRef } from 'vue'
import { Marker, type Map as MapboxMap } from 'mapbox-gl'
import { DOM_CAP, type PointsCollection } from '../lib/types'

function pickFeatures(fc: PointsCollection) {
  const feats = fc.features
  if (feats.length <= DOM_CAP) return feats
  // Cities: top-N by population is deterministic and geographically sensible.
  // Synthetic data has no population — take the first N (generation is seeded).
  if (feats[0]?.properties && 'population' in feats[0].properties) {
    return [...feats]
      .sort((a, b) => (b.properties as { population: number }).population - (a.properties as { population: number }).population)
      .slice(0, DOM_CAP)
  }
  return feats.slice(0, DOM_CAP)
}

/**
 * The DOM branch of the comparison: one absolutely-positioned element per
 * marker. Creating even 2k nodes is a visible synchronous freeze — that is
 * part of the demo's narrative, deliberately not masked or chunked.
 */
export function useDomMarkers(map: ShallowRef<MapboxMap | null>) {
  let markers: Marker[] = []

  function clear() {
    for (const mk of markers) mk.remove()
    markers = []
  }

  function render(fc: PointsCollection): Promise<number> {
    const m = map.value
    if (!m) return Promise.resolve(0)
    clear()
    const t0 = performance.now()
    for (const f of pickFeatures(fc)) {
      const el = document.createElement('div')
      el.className = 'dom-marker'
      markers.push(
        new Marker({ element: el })
          .setLngLat(f.geometry.coordinates as [number, number])
          .addTo(m),
      )
    }
    // Double rAF: resolve after the browser has actually presented a frame
    // with the new nodes, not merely after the synchronous loop.
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve(performance.now() - t0))
      })
    })
  }

  onUnmounted(clear)

  return { render, clear }
}
