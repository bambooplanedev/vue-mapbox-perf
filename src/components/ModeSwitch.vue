<script setup lang="ts">
import type { AppMode } from '../lib/types'

defineProps<{ mode: AppMode }>()
const emit = defineEmits<{ 'update:mode': [mode: AppMode] }>()
const modes: { id: AppMode; label: string }[] = [
  { id: 'performance', label: 'Performance' },
  { id: 'clustering', label: 'Clustering' },
]
</script>

<template>
  <div class="mode-switch" role="tablist">
    <button
      v-for="m in modes"
      :key="m.id"
      role="tab"
      :aria-selected="mode === m.id"
      :class="{ active: mode === m.id }"
      @click="emit('update:mode', m.id)"
    >
      {{ m.label }}
    </button>
  </div>
</template>

<style scoped>
.mode-switch { display: flex; border: 1px solid var(--bp-border); border-radius: 8px; overflow: hidden; }
.mode-switch button {
  padding: 6px 14px; border: none; background: transparent;
  color: var(--bp-offwhite); font-weight: 600;
}
.mode-switch button.active { background: var(--bp-green-deep); color: var(--bp-white); }
</style>
