<script setup lang="ts">
import { provide, ref, shallowRef, watch } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import MapCanvas from './components/MapCanvas.vue'
import FallbackScreen from './components/FallbackScreen.vue'
import ModeSwitch from './components/ModeSwitch.vue'
import ControlsSidebar from './components/ControlsSidebar.vue'
import PerformanceMode from './components/PerformanceMode.vue'
import ClusteringMode from './components/ClusteringMode.vue'
import StatsPanel from './components/StatsPanel.vue'
import { MAP_KEY, MAP_READY_KEY } from './composables/useMapbox'
import { createPointsSource, POINTS_SOURCE_KEY } from './composables/usePointsSource'
import { useFps } from './composables/useFps'
import { useStressTest } from './composables/useStressTest'
import { createMetrics, measureTimeToVisible, METRICS_KEY } from './composables/useMetrics'
import { generatePoints } from './lib/generatePoints'
import { loadCities } from './lib/loadCities'
import { EMPTY_COLLECTION, type AppMode, type PointsCollection, type RendererKind, type SourceKind } from './lib/types'

// shallowRef is mandatory: deep reactivity on a Map instance corrupts its
// internals and tanks performance.
const map = shallowRef<MapboxMap | null>(null)
const mapReady = ref(false)
provide(MAP_KEY, map)
provide(MAP_READY_KEY, mapReady)

const fatal = ref<'no-token' | 'map-error' | null>(
  import.meta.env.VITE_MAPBOX_TOKEN ? null : 'no-token',
)

// Default state sells the thesis without a single click: 25k WebGL markers.
const mode = ref<AppMode>('performance')
const sourceKind = ref<SourceKind>('synthetic')
const count = ref(25000)
const renderer = ref<RendererKind>('webgl')

const pointsSource = createPointsSource(map)
provide(POINTS_SOURCE_KEY, pointsSource)

const metrics = createMetrics()
provide(METRICS_KEY, metrics)

const { fps, worstFrameMs, measuring } = useFps(map, mapReady)
const stress = useStressTest(map)

// While measuring in performance mode, keep the current branch's last FPS.
watch(fps, (v) => {
  if (v !== null && mode.value === 'performance') {
    metrics.recordFps(renderer.value, v, worstFrameMs.value ?? 0)
  }
})

const dataError = ref(false)
const collection = shallowRef<PointsCollection>(EMPTY_COLLECTION)

watch([sourceKind, count], async ([kind]) => {
  if (kind === 'synthetic') {
    collection.value = generatePoints({ count: count.value })
    return
  }
  try {
    dataError.value = false
    collection.value = await loadCities()
  } catch {
    dataError.value = true
    sourceKind.value = 'synthetic' // fall back — the demo must stay alive
  }
}, { immediate: true })

watch([mapReady, collection], async ([ready]) => {
  if (!ready) return
  pointsSource.setData(collection.value)
  if (mode.value === 'performance' && renderer.value === 'webgl' && map.value) {
    const ms = await measureTimeToVisible(map.value)
    if (ms !== null) metrics.recordTime('webgl', ms)
  }
}, { immediate: true })

function switchMode(next: AppMode) {
  stress.stop()
  map.value?.stop() // interrupt any camera flight before layers change hands
  mode.value = next
}
</script>

<template>
  <div class="app">
    <header class="app-header">
      <strong>vue-mapbox-perf</strong>
      <ModeSwitch :mode="mode" @update:mode="switchMode" />
      <span class="tagline">50,000 markers &middot; one WebGL layer &middot; zero DOM nodes</span>
    </header>
    <div class="app-body">
      <ControlsSidebar
        :mode="mode"
        :source-kind="sourceKind"
        :count="count"
        :renderer="renderer"
        :data-error="dataError"
        @update:source-kind="sourceKind = $event"
        @update:count="count = $event"
        @update:renderer="renderer = $event"
      >
        <section>
          <h3>Stress test</h3>
          <button class="stress" :class="{ active: stress.active.value }" @click="stress.toggle()">
            {{ stress.active.value ? 'Stop orbit' : 'Start orbit' }}
          </button>
        </section>
      </ControlsSidebar>
      <main class="app-main">
        <FallbackScreen v-if="fatal" :reason="fatal" />
        <template v-else>
          <MapCanvas @fatal="fatal = 'map-error'" />
          <StatsPanel
            :mode="mode"
            :fps="fps"
            :worst-frame-ms="worstFrameMs"
            :measuring="measuring"
            :results="metrics.results"
          />
          <template v-if="mapReady">
            <PerformanceMode v-if="mode === 'performance'" :renderer="renderer" />
            <ClusteringMode v-else-if="mode === 'clustering'" />
          </template>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; }
.app-header {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 16px; border-bottom: 1px solid var(--bp-border);
}
.tagline { margin-left: auto; color: var(--bp-green); font-size: 0.85rem; }
.app-body { display: flex; flex: 1; min-height: 0; }
.app-main { position: relative; flex: 1; }
.app-body section h3 { margin: 0 0 6px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--bp-green); }
.stress {
  width: 100%; padding: 8px; border-radius: 8px; font-weight: 700;
  border: 1px solid var(--bp-green); background: transparent; color: var(--bp-green);
}
.stress.active { background: var(--bp-green-deep); color: var(--bp-white); }
</style>
