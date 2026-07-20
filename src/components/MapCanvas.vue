<script setup lang="ts">
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, onUnmounted, ref } from 'vue'
import { useMap } from '../composables/useMapbox'
import { DEFAULT_CENTER } from '../lib/generatePoints'

const emit = defineEmits<{ fatal: [message: string] }>()
const container = ref<HTMLDivElement | null>(null)
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
</template>

<style scoped>
.map-canvas { position: absolute; inset: 0; }
</style>
