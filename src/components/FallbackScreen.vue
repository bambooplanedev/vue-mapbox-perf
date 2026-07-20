<script setup lang="ts">
defineProps<{ reason: 'no-token' | 'map-error' }>()
const isDev = import.meta.env.DEV
const repoUrl = 'https://github.com/virakachurovska/vue-mapbox-perf'
</script>

<template>
  <div class="fallback">
    <template v-if="isDev">
      <h2>Mapbox token missing or rejected</h2>
      <p>
        Copy <code>.env.example</code> to <code>.env</code> and set
        <code>VITE_MAPBOX_TOKEN</code> to a free token from
        <a href="https://console.mapbox.com/">console.mapbox.com</a>, then restart the dev server.
      </p>
    </template>
    <template v-else>
      <h2>Map temporarily unavailable</h2>
      <p>
        The demo can't reach Mapbox right now. See the recorded run in the
        <a :href="repoUrl">README</a>.
      </p>
    </template>
    <p class="reason">({{ reason }})</p>
  </div>
</template>

<style scoped>
.fallback {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; text-align: center; padding: 24px;
}
.fallback a { color: var(--bp-green); }
.fallback code { background: var(--bp-surface); padding: 2px 6px; border-radius: 4px; }
.reason { color: var(--bp-border); font-size: 0.8rem; }
</style>
