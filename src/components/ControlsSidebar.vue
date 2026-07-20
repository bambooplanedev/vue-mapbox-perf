<script setup lang="ts">
import { ref, watch } from 'vue'
import { DOM_CAP, type AppMode, type RendererKind, type SourceKind } from '../lib/types'

const props = defineProps<{
  mode: AppMode
  sourceKind: SourceKind
  count: number
  renderer: RendererKind
  dataError?: boolean
}>()
const emit = defineEmits<{
  'update:sourceKind': [v: SourceKind]
  'update:count': [v: number]
  'update:renderer': [v: RendererKind]
}>()

// The thumb moves instantly; the expensive regeneration is debounced.
const localCount = ref(props.count)
watch(() => props.count, (v) => (localCount.value = v))
let timer: ReturnType<typeof setTimeout> | undefined
watch(localCount, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:count', v), 250)
})

const fmt = (n: number) => n.toLocaleString('en-US')
</script>

<template>
  <aside class="sidebar">
    <section>
      <h3>Data source</h3>
      <label><input type="radio" value="synthetic" :checked="sourceKind === 'synthetic'" @change="emit('update:sourceKind', 'synthetic')" /> Synthetic</label>
      <label><input type="radio" value="cities" :checked="sourceKind === 'cities'" @change="emit('update:sourceKind', 'cities')" /> World cities</label>
    </section>

    <p v-if="dataError" class="banner">
      Couldn't load the cities dataset — switched back to synthetic data.
    </p>

    <section v-if="sourceKind === 'synthetic'">
      <h3>Points: {{ fmt(renderer === 'dom' && mode === 'performance' ? Math.min(localCount, DOM_CAP) : localCount) }}</h3>
      <input
        v-model.number="localCount"
        type="range"
        :min="1000"
        :max="renderer === 'dom' && mode === 'performance' ? DOM_CAP : 50000"
        :step="500"
      />
    </section>

    <section v-if="mode === 'performance'">
      <h3>Renderer</h3>
      <label><input type="radio" value="webgl" :checked="renderer === 'webgl'" @change="emit('update:renderer', 'webgl')" /> WebGL layer</label>
      <label><input type="radio" value="dom" :checked="renderer === 'dom'" @change="emit('update:renderer', 'dom')" /> DOM markers</label>
      <p v-if="renderer === 'dom'" class="badge">
        DOM capped at {{ fmt(DOM_CAP) }} — this is the point. One node per marker
        stops scaling long before WebGL does.
      </p>
    </section>

    <slot />
  </aside>
</template>

<style scoped>
.sidebar {
  width: 230px; padding: 16px; display: flex; flex-direction: column; gap: 18px;
  border-right: 1px solid var(--bp-border); background: var(--bp-charcoal);
  overflow-y: auto;
}
.sidebar h3 { margin: 0 0 6px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--bp-green); }
.sidebar label { display: block; padding: 3px 0; font-size: 0.9rem; }
.sidebar input[type='range'] { width: 100%; accent-color: var(--bp-green); }
.badge {
  margin: 8px 0 0; padding: 8px; font-size: 0.8rem; border-radius: 6px;
  background: var(--bp-surface); border-left: 3px solid var(--bp-green-forest);
}
.banner {
  margin: 0; padding: 8px; font-size: 0.8rem; border-radius: 6px;
  background: var(--bp-surface); border-left: 3px solid var(--bp-border);
}
</style>
