import type { FeatureCollection, Point } from 'geojson'

export type AppMode = 'performance' | 'clustering'
export type SourceKind = 'synthetic' | 'cities'
export type RendererKind = 'webgl' | 'dom'

export interface CityProps {
  name: string
  country: string
  population: number
}

export interface SyntheticProps {
  id: number
}

export type PointProps = CityProps | SyntheticProps
export type PointsCollection = FeatureCollection<Point, PointProps>

export const EMPTY_COLLECTION: PointsCollection = {
  type: 'FeatureCollection',
  features: [],
}

/** Hard cap for the DOM-marker branch — the cap itself is part of the demo's narrative. */
export const DOM_CAP = 2000
