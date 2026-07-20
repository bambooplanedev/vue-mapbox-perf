import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/vue-mapbox-perf/',
  plugins: [vue()],
  test: { environment: 'node' },
})
