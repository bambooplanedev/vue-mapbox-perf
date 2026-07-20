export interface FrameStats {
  fps: number
  worstFrameMs: number
  sampleCount: number
}

export interface FrameWindow {
  push(t: number): void
  stats(): FrameStats | null
  reset(): void
}

/**
 * Time-based sliding window over frame timestamps. The window is defined in
 * milliseconds, not frames, so the averaging period is identical on 60 Hz
 * and 120 Hz displays.
 */
export function createFrameWindow(windowMs = 1000): FrameWindow {
  const timestamps: number[] = []

  return {
    push(t: number) {
      timestamps.push(t)
      const cutoff = t - windowMs
      while (timestamps.length > 0 && timestamps[0] < cutoff) timestamps.shift()
    },
    stats(): FrameStats | null {
      if (timestamps.length < 2) return null
      const spanMs = timestamps[timestamps.length - 1] - timestamps[0]
      if (spanMs <= 0) return null
      const frames = timestamps.length - 1
      let worst = 0
      for (let i = 1; i < timestamps.length; i++) {
        worst = Math.max(worst, timestamps[i] - timestamps[i - 1])
      }
      return { fps: (frames * 1000) / spanMs, worstFrameMs: worst, sampleCount: frames }
    },
    reset() {
      timestamps.length = 0
    },
  }
}
