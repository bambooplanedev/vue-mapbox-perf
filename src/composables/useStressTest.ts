import { onUnmounted, ref, type ShallowRef } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'

/**
 * Primary measurement scenario: an endless camera orbit. The same animation
 * for both renderer branches — flip DOM↔WebGL and watch the numbers diverge.
 */
export function useStressTest(map: ShallowRef<MapboxMap | null>) {
  const active = ref(false)

  const step = () => {
    const m = map.value
    if (!m || !active.value) return
    m.easeTo({ bearing: m.getBearing() + 90, duration: 2500, easing: (t) => t })
  }

  const onMoveEnd = () => {
    if (active.value) step()
  }

  function start() {
    const m = map.value
    if (!m || active.value) return
    active.value = true
    m.on('moveend', onMoveEnd)
    step()
  }

  function stop() {
    const m = map.value
    if (!active.value) return
    active.value = false
    m?.off('moveend', onMoveEnd)
    m?.stop()
  }

  function toggle() {
    if (active.value) stop()
    else start()
  }

  onUnmounted(stop)

  return { active, toggle, stop }
}
