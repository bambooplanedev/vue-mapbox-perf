<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch } from 'vue'
import { useMap } from '../composables/useMapbox'
import { POINTS_SOURCE_KEY, SOURCE_ID } from '../composables/usePointsSource'
import { METRICS_KEY } from '../composables/useMetrics'
import { useDomMarkers } from '../composables/useDomMarkers'
import type { RendererKind } from '../lib/types'

const props = defineProps<{ renderer: RendererKind }>()

const { map } = useMap()
const source = inject(POINTS_SOURCE_KEY)!
const metrics = inject(METRICS_KEY)!
const dom = useDomMarkers(map)

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

async function apply() {
  if (props.renderer === 'webgl') {
    dom.clear()
    addCircleLayer()
  } else {
    removeCircleLayer()
    const ms = await dom.render(source.data.value)
    metrics.recordTime('dom', ms)
  }
}

onMounted(() => {
  source.ensureSource({ cluster: false })
  source.setData(source.data.value) // re-fill after a possible recreate
  apply()
})

watch(() => props.renderer, apply)
watch(source.data, () => {
  if (props.renderer === 'dom') apply()
})

onUnmounted(() => {
  removeCircleLayer()
  dom.clear()
})
</script>

<template><!-- renderless: manages map layers and DOM markers only --></template>
