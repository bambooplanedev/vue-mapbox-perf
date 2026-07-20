/**
 * Palette for Mapbox paint expressions. Mapbox can't read CSS custom
 * properties, so these mirror the `--bp-*` values in styles/theme.css by hand —
 * keep the two in sync. This is the single source of truth for JS-side colors.
 */
export const MAP_COLORS = {
  green: '#4CAF50', // --bp-green
  greenDeep: '#256325', // --bp-green-deep
  greenForest: '#2f6b2f', // --bp-green-forest
  offwhite: '#f7f7f5', // cluster stroke + label text
} as const
