import { describe, expect, it } from 'vitest'
import { createFrameWindow } from '../src/lib/slidingAverage'

function feed(win: ReturnType<typeof createFrameWindow>, start: number, count: number, intervalMs: number) {
  for (let i = 0; i < count; i++) win.push(start + i * intervalMs)
}

describe('createFrameWindow', () => {
  it('returns null before two samples', () => {
    const win = createFrameWindow(1000)
    expect(win.stats()).toBeNull()
    win.push(0)
    expect(win.stats()).toBeNull()
  })

  it('computes ~60 fps for evenly spaced 16.67ms frames', () => {
    const win = createFrameWindow(1000)
    feed(win, 0, 61, 1000 / 60)
    const s = win.stats()
    expect(s).not.toBeNull()
    expect(s!.fps).toBeCloseTo(60, 0)
    expect(s!.worstFrameMs).toBeCloseTo(1000 / 60, 1)
  })

  it('reports the worst frame in the window', () => {
    const win = createFrameWindow(1000)
    win.push(0)
    win.push(16)
    win.push(216) // one 200ms hitch
    win.push(232)
    expect(win.stats()!.worstFrameMs).toBe(200)
  })

  it('evicts samples older than the window', () => {
    const win = createFrameWindow(100)
    win.push(0) // will be evicted
    feed(win, 5000, 7, 10)
    const s = win.stats()!
    expect(s.fps).toBeCloseTo(100, 0)
    expect(s.worstFrameMs).toBe(10)
  })

  it('reset clears all samples', () => {
    const win = createFrameWindow(1000)
    feed(win, 0, 10, 16)
    win.reset()
    expect(win.stats()).toBeNull()
  })
})
