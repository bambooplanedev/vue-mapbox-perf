<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import MapCanvas from './components/MapCanvas.vue'
import FallbackScreen from './components/FallbackScreen.vue'
import ModeSwitch from './components/ModeSwitch.vue'
import ControlsSidebar from './components/ControlsSidebar.vue'
import PerformanceMode from './components/PerformanceMode.vue'
import { MAP_KEY, MAP_READY_KEY } from './composables/useMapbox'
import { createPointsSource, POINTS_SOURCE_KEY } from './composables/usePointsSource'
import { generatePoints } from './lib/generatePoints'
import type { AppMode, RendererKind, SourceKind } from './lib/types'

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

const collection = computed(() => generatePoints({ count: count.value }))

watch([mapReady, collection], ([ready]) => {
  if (!ready) return
  pointsSource.setData(collection.value)
}, { immediate: true })

function switchMode(next: AppMode) {
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
        @update:source-kind="sourceKind = $event"
        @update:count="count = $event"
        @update:renderer="renderer = $event"
      />
      <main class="app-main">
        <FallbackScreen v-if="fatal" :reason="fatal" />
        <template v-else>
          <MapCanvas @fatal="fatal = 'map-error'" />
          <template v-if="mapReady">
            <PerformanceMode v-if="mode === 'performance'" :renderer="renderer" />
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
</style>
