import { onUnmounted, ref, watch, type Ref, type ShallowRef } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import { createFrameWindow } from '../lib/slidingAverage'

/**
 * FPS is only meaningful while the camera moves: Mapbox renders on demand,
 * so on a static map rAF would happily report the display's refresh rate
 * regardless of load. Outside movement the panel shows "idle".
 */
export function useFps(map: ShallowRef<MapboxMap | null>, mapReady: Ref<boolean>) {
  const fps = ref<number | null>(null)
  const worstFrameMs = ref<number | null>(null)
  const measuring = ref(false)
  const win = createFrameWindow(1000)
  let raf = 0

  const tick = (t: number) => {
    win.push(t)
    const s = win.stats()
    if (s) {
      fps.value = Math.round(s.fps)
      worstFrameMs.value = Math.round(s.worstFrameMs)
    }
    raf = requestAnimationFrame(tick)
  }

  const start = () => {
    if (measuring.value) return
    measuring.value = true
    win.reset()
    raf = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (!measuring.value) return
    measuring.value = false
    cancelAnimationFrame(raf)
    fps.value = null
    worstFrameMs.value = null
  }

  const unwatch = watch(mapReady, (ready) => {
    const m = map.value
    if (!ready || !m) return
    m.on('movestart', start)
    m.on('moveend', stop)
  }, { immediate: true })

  onUnmounted(() => {
    unwatch()
    stop()
    const m = map.value
    m?.off('movestart', start)
    m?.off('moveend', stop)
  })

  return { fps, worstFrameMs, measuring }
}
