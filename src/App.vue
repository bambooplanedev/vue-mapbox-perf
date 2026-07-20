<script setup lang="ts">
import { provide, ref, shallowRef } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import MapCanvas from './components/MapCanvas.vue'
import FallbackScreen from './components/FallbackScreen.vue'
import { MAP_KEY, MAP_READY_KEY } from './composables/useMapbox'

// shallowRef is mandatory: deep reactivity on a Map instance corrupts its
// internals and tanks performance.
const map = shallowRef<MapboxMap | null>(null)
const mapReady = ref(false)
provide(MAP_KEY, map)
provide(MAP_READY_KEY, mapReady)

const fatal = ref<'no-token' | 'map-error' | null>(
  import.meta.env.VITE_MAPBOX_TOKEN ? null : 'no-token',
)
</script>

<template>
  <div class="app">
    <header class="app-header">
      <strong>vue-mapbox-perf</strong>
      <span class="tagline">50,000 markers &middot; one WebGL layer &middot; zero DOM nodes</span>
    </header>
    <main class="app-main">
      <FallbackScreen v-if="fatal" :reason="fatal" />
      <MapCanvas v-else @fatal="fatal = 'map-error'" />
    </main>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; }
.app-header {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 16px; border-bottom: 1px solid var(--bp-border);
}
.tagline { color: var(--bp-green); font-size: 0.85rem; }
.app-main { position: relative; flex: 1; }
</style>
