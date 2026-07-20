<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'
import { useMap } from '../composables/useMapbox'
import { POINTS_SOURCE_KEY, SOURCE_ID } from '../composables/usePointsSource'
import type { RendererKind } from '../lib/types'

defineProps<{ renderer: RendererKind }>()

const { map } = useMap()
const source = inject(POINTS_SOURCE_KEY)!

const LAYER_ID = 'points-circles'

function addCircleLayer() {
  const m = map.value
  if (!m || m.getLayer(LAYER_ID)) return
  m.addLayer({
    id: LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-radius': 4,
      'circle-color': '#4CAF50',
      'circle-opacity': 0.85,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#256325',
    },
  })
}

function removeCircleLayer() {
  const m = map.value
  if (m?.getLayer(LAYER_ID)) m.removeLayer(LAYER_ID)
}

onMounted(() => {
  source.ensureSource({ cluster: false })
  source.setData(source.data.value) // re-fill after a possible recreate
  addCircleLayer()
})

onUnmounted(() => {
  removeCircleLayer()
})
</script>

<template><!-- renderless: manages map layers only --></template>
