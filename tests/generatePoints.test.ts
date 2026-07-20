import { describe, expect, it } from 'vitest'
import { generatePoints, mulberry32 } from '../src/lib/generatePoints'

describe('mulberry32', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = mulberry32(123)
    const b = mulberry32(123)
    for (let i = 0; i < 100; i++) {
      const v = a()
      expect(v).toBe(b())
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('generatePoints', () => {
  it('generates exactly count features with sequential ids', () => {
    const fc = generatePoints({ count: 500 })
    expect(fc.features).toHaveLength(500)
    expect(fc.features[0].properties).toEqual({ id: 0 })
    expect(fc.features[499].properties).toEqual({ id: 499 })
  })

  it('is deterministic for the same seed and differs across seeds', () => {
    const a = generatePoints({ count: 200, seed: 7 })
    const b = generatePoints({ count: 200, seed: 7 })
    const c = generatePoints({ count: 200, seed: 8 })
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c))
  })

  it('clamps coordinates to Mercator-safe bounds even at extreme centers', () => {
    const fc = generatePoints({ count: 2000, center: [179, 84], seed: 1 })
    for (const f of fc.features) {
      const [lng, lat] = f.geometry.coordinates
      expect(lng).toBeGreaterThanOrEqual(-180)
      expect(lng).toBeLessThanOrEqual(180)
      expect(lat).toBeGreaterThanOrEqual(-85)
      expect(lat).toBeLessThanOrEqual(85)
    }
  })
})
