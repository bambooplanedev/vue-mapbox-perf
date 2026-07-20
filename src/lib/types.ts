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
