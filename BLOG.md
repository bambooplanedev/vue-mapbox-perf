# Why 50,000 markers don't need 50,000 DOM nodes

*A write-up of what [this demo](https://bambooplanedev.github.io/vue-mapbox-perf/) actually measures.*

## The problem with one node per marker

`mapboxgl.Marker` positions an absolutely-positioned element with `transform` — no
reflow. So why does the DOM branch fall apart? <!-- Fill in AFTER profiling: attach
a DevTools Performance trace of the DOM branch during the stress orbit and describe
the actual bottleneck (expected: O(N) reprojection — project() plus a style write
per element — on the main thread every frame of camera movement, plus paint/composite
of thousands of separate nodes). Include the trace screenshot. Do NOT claim "layout
thrashing" — the trace will not show layout. -->

Even before the camera moves: creating 2,000 marker nodes is a synchronous freeze of
`_` ms on my machine — visible the moment you flip the toggle.

## One layer instead

The WebGL branch pushes the same data through a single `GeoJSONSource`:

```ts
// src/composables/usePointsSource.ts
function setData(fc: PointsCollection) {
  data.value = fc
  const src = map.value?.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
  src?.setData(fc)
}
```

One source, one `circle` layer, one draw call — the per-point cost lives on the GPU,
not in the DOM.

## Measured (honestly)

Machine: `_` (CPU, RAM, display refresh rate, browser version).
Method: FPS is a 1-second sliding window over rAF timestamps, sampled **only while
the camera moves** — Mapbox renders on demand, so a static map would show a fake 60.
The workload is the built-in stress orbit (continuous 90°/2.5s bearing rotation).
"Data → visible" is `setData()` → the map's next `idle` event: it includes worker
serialization and tiling, not just rendering — which is why it is not called
"render time".

| Points | DOM markers (fps) | WebGL layer (fps) |
| ------ | ----------------- | ----------------- |
| 500    | _                 | _                 |
| 1,000  | _                 | _                 |
| 2,000  | _                 | _                 |
| 10,000 | n/a (capped)      | _                 |
| 50,000 | n/a (capped)      | _                 |

Seeded generation (`generatePoints({ count, seed })`) makes these numbers
reproducible — same seed, same points, same run.

## Why not just cluster?

Clustering is the demo's second mode, not the answer to the first. Clusters *hide*
distribution and density — 50k points collapse into a few circles, and the shape of
the data is gone. The WebGL layer shows every point without aggregation; clustering
is complementary (that's why it's a mode, not a replacement). Alternatives like
deck.gl solve the same problem with a heavier dependency than one built-in layer
warrants here.

## The trade-off

You give up per-marker HTML. A `circle` layer can't hold a custom avatar, a CSS
animation, or arbitrary markup per point — that's what DOM markers are for, and
below ~500 points they're perfectly fine. Pay flexibility, get scale.
