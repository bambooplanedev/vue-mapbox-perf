import { reactive, type InjectionKey } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { RendererKind } from '../lib/types'

export interface BranchResult {
  fps?: number
  worstFrameMs?: number
  timeMs?: number
}

export interface MetricsApi {
  results: { webgl: BranchResult; dom: BranchResult }
  recordTime(branch: RendererKind, ms: number): void
  recordFps(branch: RendererKind, fps: number, worst: number): void
}

export const METRICS_KEY = Symbol('metrics') as InjectionKey<MetricsApi>

/** Remembers the last result of EACH branch so the contrast stays visible side by side. */
export function createMetrics(): MetricsApi {
  const results = reactive<MetricsApi['results']>({ webgl: {}, dom: {} })
  return {
    results,
    recordTime(branch, ms) {
      results[branch].timeMs = Math.round(ms)
    },
    recordFps(branch, fps, worst) {
      results[branch].fps = fps
      results[branch].worstFrameMs = worst
    },
  }
}

let ttvToken = 0

/**
 * "Time to visible" for the WebGL branch: setData() → next idle. The number
 * includes worker serialization + tiling + render — the honest name for it
 * is NOT "render time". A newer measurement supersedes an in-flight one;
 * a measurement taken while the camera moves is discarded (idle would be
 * polluted by the camera, not the data).
 */
export function measureTimeToVisible(map: MapboxMap): Promise<number | null> {
  const token = ++ttvToken
  const t0 = performance.now()
  const moving = map.isMoving()
  return new Promise((resolve) => {
    map.once('idle', () => {
      resolve(token === ttvToken && !moving && !map.isMoving() ? performance.now() - t0 : null)
    })
  })
}
