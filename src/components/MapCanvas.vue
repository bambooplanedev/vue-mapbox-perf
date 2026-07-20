<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, onUnmounted, ref } from 'vue'
import { useMap } from '../composables/useMapbox'
import { DEFAULT_CENTER } from '../lib/generatePoints'

const emit = defineEmits<{ fatal: [message: string] }>()
const container = ref<HTMLDivElement | null>(null)
// `mapReady` (fired on style 'load') is too early to hide a loader: tiles are
// still streaming in, so the user sees a blank charcoal rectangle for a beat.
// `loading` stays true until the map's first 'idle' — all tiles loaded and the
// first frame painted — so the overlay covers the whole cold-start gap.
const loading = ref(true)
// The Map instance needs a DOM container, so it can only be created here in
// onMounted — but consumers live in sibling components, so the refs are
// provided by App and merely filled in by this component.
const { map, mapReady } = useMap()

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
  const m = new mapboxgl.Map({
    container: container.value!,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: DEFAULT_CENTER,
    zoom: 3.5,
  })
  m.on('load', () => {
    mapReady.value = true
  })
  m.once('idle', () => {
    loading.value = false
  })
  m.on('error', (e) => {
    const status = (e.error as { status?: number } | undefined)?.status
    // error fires for non-fatal noise too (lost tiles, sprites); only an
    // auth failure or anything before first load is fatal.
    if (status === 401 || status === 403 || !mapReady.value) {
      emit('fatal', e.error?.message ?? 'Map failed to load')
    } else {
      console.warn('mapbox non-fatal error:', e.error)
    }
  })
  map.value = m
})

onUnmounted(() => {
  map.value?.remove()
  map.value = null
  mapReady.value = false
})
</script>

<template>
  <div ref="container" class="map-canvas" />
  <div v-if="loading" class="map-loading">
    <span class="map-loading-dot" />
    <span>Loading map&hellip;</span>
  </div>
</template>

<style scoped>
.map-canvas { position: absolute; inset: 0; }
.map-loading {
  position: absolute; inset: 0; z-index: 6;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  background: var(--bp-charcoal); color: var(--bp-green);
  font-weight: 600; letter-spacing: 0.02em;
}
.map-loading-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--bp-green);
  animation: map-loading-pulse 1s ease-in-out infinite;
}
@keyframes map-loading-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.1); }
}
@media (prefers-reduced-motion: reduce) {
  .map-loading-dot { animation: none; opacity: 0.7; }
}
</style>
