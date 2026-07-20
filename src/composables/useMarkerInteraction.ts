import { Popup, type GeoJSONSource, type Map as MapboxMap, type MapMouseEvent } from 'mapbox-gl'
import type { Point } from 'geojson'
import { SOURCE_ID } from './usePointsSource'

export interface InteractionLayers {
  clusterLayer: string
  pointLayer: string
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

/**
 * Hover cursor + popups + cluster zoom for the clustering mode. Deliberately
 * NOT attached in performance mode: hit-testing 50k points on mousemove is
 * not free and would pollute the FPS measurement.
 */
export function attachMarkerInteraction(m: MapboxMap, layers: InteractionLayers): () => void {
  let popup: Popup | null = null

  const onClusterClick = (e: MapMouseEvent) => {
    const f = m.queryRenderedFeatures(e.point, { layers: [layers.clusterLayer] })[0]
    if (!f) return
    const clusterId = f.properties?.cluster_id as number
    const src = m.getSource(SOURCE_ID) as GeoJSONSource
    src.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || zoom == null) return
      m.easeTo({ center: (f.geometry as Point).coordinates as [number, number], zoom })
    })
  }

  const onPointClick = (e: MapMouseEvent) => {
    const f = e.features?.[0]
    if (!f) return
    const coords = (f.geometry as Point).coordinates as [number, number]
    const p = f.properties ?? {}
    const html =
      'population' in p
        ? `<strong>${escapeHtml(String(p.name))}</strong><br>${escapeHtml(String(p.country))}<br>pop. ${Number(p.population).toLocaleString('en-US')}`
        : `point #${Number(p.id)}<br>${coords[0].toFixed(3)}, ${coords[1].toFixed(3)}`
    popup?.remove()
    popup = new Popup({ offset: 12 }).setLngLat(coords).setHTML(html).addTo(m)
  }

  const setPointer = () => { m.getCanvas().style.cursor = 'pointer' }
  const clearPointer = () => { m.getCanvas().style.cursor = '' }

  m.on('click', layers.clusterLayer, onClusterClick)
  m.on('click', layers.pointLayer, onPointClick)
  for (const layer of [layers.clusterLayer, layers.pointLayer]) {
    m.on('mouseenter', layer, setPointer)
    m.on('mouseleave', layer, clearPointer)
  }

  return () => {
    popup?.remove()
    m.off('click', layers.clusterLayer, onClusterClick)
    m.off('click', layers.pointLayer, onPointClick)
    for (const layer of [layers.clusterLayer, layers.pointLayer]) {
      m.off('mouseenter', layer, setPointer)
      m.off('mouseleave', layer, clearPointer)
    }
    clearPointer()
  }
}
