<script setup lang="ts">
import { inject, onMounted, onUnmounted } from 'vue'
import { useMap } from '../composables/useMap'
import { POINTS_SOURCE_KEY, SOURCE_ID } from '../composables/usePointsSource'
import { attachMarkerInteraction } from '../composables/useMarkerInteraction'
import { MAP_COLORS } from '../lib/mapColors'

const { map } = useMap()
const source = inject(POINTS_SOURCE_KEY)!

const LAYERS = ['clusters', 'cluster-count', 'unclustered-point'] as const
let cleanupInteraction: (() => void) | null = null

onMounted(() => {
  const m = map.value
  if (!m) return
  source.ensureSource({ cluster: true })
  source.setData(source.data.value) // re-fill after recreate

  m.addLayer({
    id: 'clusters',
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], MAP_COLORS.green, 100, MAP_COLORS.greenForest, 750, MAP_COLORS.greenDeep],
      'circle-radius': ['step', ['get', 'point_count'], 15, 100, 22, 750, 30],
      'circle-stroke-width': 1,
      'circle-stroke-color': MAP_COLORS.offwhite,
    },
  })
  m.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: { 'text-color': MAP_COLORS.offwhite },
  })
  m.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': MAP_COLORS.green,
      'circle-radius': 5,
      'circle-stroke-width': 1,
      'circle-stroke-color': MAP_COLORS.greenDeep,
    },
  })

  cleanupInteraction = attachMarkerInteraction(m, {
    clusterLayer: 'clusters',
    pointLayer: 'unclustered-point',
  })
})

onUnmounted(() => {
  cleanupInteraction?.()
  const m = map.value
  if (!m) return
  for (const id of LAYERS) {
    if (m.getLayer(id)) m.removeLayer(id)
  }
})
</script>

<template><!-- renderless: manages cluster layers only --></template>
