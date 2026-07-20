<script setup lang="ts">
import type { AppMode } from '../lib/types'
import type { MetricsApi } from '../composables/useMetrics'

defineProps<{
  mode: AppMode
  fps: number | null
  worstFrameMs: number | null
  measuring: boolean
  results: MetricsApi['results']
}>()
</script>

<template>
  <div class="stats">
    <div class="live">
      <span class="label">FPS</span>
      <span v-if="measuring && fps !== null" class="fps">{{ fps }}</span>
      <span v-else class="idle">idle</span>
      <span v-if="measuring && worstFrameMs !== null" class="worst">worst {{ worstFrameMs }}ms</span>
    </div>
    <p v-if="!measuring" class="hint">drag the map to feel the difference</p>

    <table v-if="mode === 'performance'" class="compare">
      <tbody>
        <tr>
          <th>WebGL</th>
          <td>{{ results.webgl.fps != null ? results.webgl.fps + ' fps' : '—' }}</td>
          <td>{{ results.webgl.timeMs != null ? results.webgl.timeMs + 'ms data→visible' : '—' }}</td>
        </tr>
        <tr>
          <th>DOM</th>
          <td>{{ results.dom.fps != null ? results.dom.fps + ' fps' : '—' }}</td>
          <td>{{ results.dom.timeMs != null ? results.dom.timeMs + 'ms create' : '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.stats {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  min-width: 210px; padding: 12px 14px; border-radius: 10px;
  background: rgba(26, 26, 26, 0.88); border: 1px solid var(--bp-border);
  font-variant-numeric: tabular-nums;
}
.live { display: flex; align-items: baseline; gap: 8px; }
.label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--bp-green); }
/* The FPS number is the single orange accent in the whole UI. */
.fps { font-size: 1.6rem; font-weight: 800; color: var(--bp-orange); }
.idle { font-size: 1.1rem; color: var(--bp-border); }
.worst { font-size: 0.75rem; color: var(--bp-offwhite); opacity: 0.7; }
.hint { margin: 4px 0 0; font-size: 0.75rem; opacity: 0.6; }
.compare { margin-top: 8px; width: 100%; font-size: 0.8rem; border-collapse: collapse; }
.compare th { text-align: left; color: var(--bp-green); font-weight: 600; padding: 2px 6px 2px 0; }
.compare td { padding: 2px 6px 2px 0; }
</style>
