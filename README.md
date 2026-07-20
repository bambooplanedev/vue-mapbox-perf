# vue-mapbox-perf

**Thousands of map markers at interactive framerates — one WebGL layer instead of one DOM node per marker.**

Live demo: https://bambooplanedev.github.io/vue-mapbox-perf/

<!-- GIF: performance mode, DOM vs WebGL toggle during stress orbit -->
<!-- GIF: clustering mode, cluster expansion -->

## What this demonstrates

- **Performance mode** — up to 50,000 points rendered through a single Mapbox GL
  `circle` layer (`GeoJSONSource.setData()`), against a DOM-marker branch that is
  deliberately capped at 2,000 (`mapboxgl.Marker`, one element per point — the cap
  *is* the point). Live FPS (only measured while the camera moves — Mapbox renders
  on demand), worst-frame time, and data→visible timing, side by side for both branches.
  A stress-test camera orbit provides the same workload for both.
- **Clustering mode** — built-in GeoJSON clustering with graded clusters,
  click-to-expand zoom, and popups.

Full write-up: [BLOG.md](./BLOG.md)

## Quick start

```bash
git clone https://github.com/bambooplanedev/vue-mapbox-perf.git
cd vue-mapbox-perf
cp .env.example .env   # put your token inside
npm install
npm run dev
```

### Getting a free Mapbox token

1. Sign up at [mapbox.com](https://www.mapbox.com/) (free tier is plenty).
2. In [your console](https://console.mapbox.com/), copy the default public token (`pk.…`).
3. Paste it into `.env` as `VITE_MAPBOX_TOKEN=pk.…`.

For a deployed fork: add the token as the `VITE_MAPBOX_TOKEN` repository secret,
enable GitHub Pages (Settings → Pages → Source: GitHub Actions), and **restrict the
token by URL** in the Mapbox console — the token ships in the bundle, restriction is
what keeps that safe.

## Data

- Synthetic points: seeded generator (`src/lib/generatePoints.ts`) — deterministic,
  so measurements are reproducible.
- World cities: [Natural Earth](https://www.naturalearthdata.com/) populated places
  (public domain), preprocessed by `scripts/prepare-cities.mjs`.

## License

[MIT](./LICENSE)
