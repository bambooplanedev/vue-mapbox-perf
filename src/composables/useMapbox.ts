import { inject, type InjectionKey, type Ref, type ShallowRef } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'

export const MAP_KEY = Symbol('map') as InjectionKey<ShallowRef<MapboxMap | null>>
export const MAP_READY_KEY = Symbol('mapReady') as InjectionKey<Ref<boolean>>

export function useMap() {
  const map = inject(MAP_KEY)
  const mapReady = inject(MAP_READY_KEY)
  if (!map || !mapReady) throw new Error('useMap() called outside the map provider')
  return { map, mapReady }
}
