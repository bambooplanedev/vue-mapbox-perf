import { shallowRef, type InjectionKey, type ShallowRef } from 'vue'
import type { GeoJSONSource, Map as MapboxMap } from 'mapbox-gl'
import { EMPTY_COLLECTION, type PointsCollection } from '../lib/types'

export const SOURCE_ID = 'points'

export interface SourceOptions {
  cluster: boolean
}

export interface PointsSourceApi {
  data: ShallowRef<PointsCollection>
  ensureSource(options: SourceOptions): void
  setData(fc: PointsCollection): void
}

export const POINTS_SOURCE_KEY = Symbol('pointsSource') as InjectionKey<PointsSourceApi>

/**
 * Single owner of the map's GeoJSON source. Mode components manage LAYERS
 * only and must never touch the source directly.
 *
 * `cluster` cannot be changed on a live source, so ensureSource recreates it
 * when the requested options differ. Recreating requires that no layer still
 * references the source — the previous mode's onUnmounted (which removes its
 * layers) is guaranteed to have run first by the mutually exclusive v-if in
 * App.
 */
export function createPointsSource(map: ShallowRef<MapboxMap | null>): PointsSourceApi {
  const data = shallowRef<PointsCollection>(EMPTY_COLLECTION)
  let current: SourceOptions | null = null

  function addSource(m: MapboxMap, options: SourceOptions) {
    m.addSource(SOURCE_ID, {
      type: 'geojson',
      data: data.value,
      cluster: options.cluster,
      ...(options.cluster ? { clusterMaxZoom: 14, clusterRadius: 50 } : {}),
    })
    current = options
  }

  function ensureSource(options: SourceOptions) {
    const m = map.value
    if (!m) return
    if (!m.getSource(SOURCE_ID)) {
      addSource(m, options)
      return
    }
    if (current?.cluster !== options.cluster) {
      m.removeSource(SOURCE_ID)
      addSource(m, options)
    }
  }

  function setData(fc: PointsCollection) {
    data.value = fc
    const src = map.value?.getSource(SOURCE_ID) as GeoJSONSource | undefined
    src?.setData(fc)
  }

  return { data, ensureSource, setData }
}
