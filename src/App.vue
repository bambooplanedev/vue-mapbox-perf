<script setup lang="ts">
</script>

<template>
  <div class="app">
    <header class="app-header">
      <strong>vue-mapbox-perf</strong>
      <span class="tagline">50,000 markers &middot; one WebGL layer &middot; zero DOM nodes</span>
    </header>
    <main class="app-main">map goes here</main>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; }
.app-header {
  display: flex; align-items: center; gap: 16px;
  padding: 10px 16px; border-bottom: 1px solid var(--bp-border);
}
.tagline { color: var(--bp-green); font-size: 0.85rem; }
.app-main { flex: 1; }
</style>
