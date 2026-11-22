export type Budget = 'free' | 'upto500' | '500to1500' | 'over1500'
export type Duration = 'upto1h' | '1to3h' | 'halfday'
export type Transport = 'walk' | 'transport' | 'both'
export type Company = 'один' | 'пара' | 'с друзьями' | 'с детьми'
export type Mood = 'поесть' | 'культурно' | 'активно' | 'атмосферно'
export type TimeOfDay = 'утро' | 'день' | 'вечер' | 'ночь'
export type Theme = 'архитектура' | 'история' | 'арт' | 'природа' | 'еда'
export type Category =
  | 'museum'
  | 'cafe'
  | 'bar'
  | 'park'
  | 'viewpoint'
  | 'art'
  | 'sport'
  | 'theatre'
  | 'zoo'
  | 'quest'
  | 'memorial'
  | 'food'
  | 'nature'

export type CoverPattern = 'waves' | 'grid' | 'arcs' | 'blobs' | 'stripes' | 'noise'

export interface Cover {
  pattern: CoverPattern
  from: string
  to: string
}

export interface Review {
  id: string
  author: string
  rating: number
  date: string
  text: string
  source?: string
}

export interface Place {
  id: string
  name: string
  shortName: string
  category: Category
  type: string
  themes: Theme[]
  mood: Mood[]
  company: Company[]
  budget: Budget
  priceText: string
  duration: Duration
  durationText: string
  timeOfDay: TimeOfDay[]
  transport: Transport
  address: string
  lat: number
  lng: number
  hours: string
  rating: number
  reviewsCount: number
  uniqueness: number
  popularity: number
  short: string
  description: string
  tips: string
  bestTime: string
  cover: Cover
  /** Фото места: путь от корня сайта (images/places/x.jpg) или абсолютный URL. */
  image?: string
  reviews: Review[]
}

export interface Collection {
  id: string
  title: string
  subtitle: string
  description: string
  placeIds: string[]
  duration: string
  placesCount: number
  cover: Cover
  accent: 'wine' | 'heavenly' | 'ink'
}

export interface Route {
  id: string
  title: string
  length: 'short' | 'long'
  durationMin: number
  distanceKm: number
  placeIds: string[]
  description: string
  cover: Cover
}

export interface Challenge {
  id: string
  title: string
  description: string
  target: number
  reward: string
  partner: string
  placeIds: string[]
  cover: Cover
  difficulty: string
}

export interface Seed {
  places: Place[]
  collections: Collection[]
  routes: Route[]
  challenges: Challenge[]
}

export interface Checkin {
  placeId: string
  at: string
  lat: number
  lng: number
  distance: number
}

export type SortMode = 'popular' | 'near' | 'unusual' | 'rating'

export interface Filters {
  budget: Budget[]
  company: Company[]
  duration: Duration[]
  category: Category[]
  theme: Theme[]
  timeOfDay: TimeOfDay[]
  transport: Transport[]
  mood: Mood[]
  q: string
  sort: SortMode
}
