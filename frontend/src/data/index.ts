import raw from './seed.json'
import type {
  Category,
  Challenge,
  Collection,
  Place,
  Route,
  Seed,
} from '../types'

const seed = raw as unknown as Seed

export const places: Place[] = seed.places.map((place) => ({
  ...place,
  reviews: place.reviews.map((review, index) => ({
    ...review,
    id: review.id ?? `${place.id}-r${index}`,
  })),
}))
export const collections: Collection[] = seed.collections
export const routes: Route[] = seed.routes
export const challenges: Challenge[] = seed.challenges

export const placeById = new Map<string, Place>(places.map((p) => [p.id, p]))

export function placesByIds(ids: string[]): Place[] {
  return ids.map((id) => placeById.get(id)).filter((p): p is Place => Boolean(p))
}

export const stats = {
  places: places.length,
  collections: collections.length,
  routes: routes.length,
  challenges: challenges.length,
  reviews: places.reduce((sum, p) => sum + p.reviewsCount, 0),
  avgRating: places.length
    ? places.reduce((sum, p) => sum + p.rating, 0) / places.length
    : 0,
}

export const categoryCounts = places.reduce<Record<string, number>>((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1
  return acc
}, {})

export const categoryList = (Object.keys(categoryCounts) as Category[]).sort(
  (a, b) => categoryCounts[b] - categoryCounts[a],
)

/** Похожие места: та же категория или общая тематика, без самого места. */
export function relatedPlaces(place: Place, limit = 3): Place[] {
  const scored = places
    .filter((p) => p.id !== place.id)
    .map((p) => {
      let score = 0
      if (p.category === place.category) score += 3
      score += p.themes.filter((t) => place.themes.includes(t)).length * 2
      if (p.budget === place.budget) score += 1
      if (p.mood.some((m) => place.mood.includes(m))) score += 1
      return { place: p, score }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.place.rating - a.place.rating)

  return scored.slice(0, limit).map((item) => item.place)
}

export const popularPlaces = [...places].sort((a, b) => b.popularity - a.popularity)
export const unusualPlaces = [...places].sort((a, b) => b.uniqueness - a.uniqueness)

/** Маршрут по координатам: суммарная длина «по прямой» между точками. */
export function routeDistanceKm(route: Route): number {
  const list = placesByIds(route.placeIds)
  let total = 0
  for (let i = 1; i < list.length; i += 1) {
    const a = list[i - 1]
    const b = list[i]
    const dLat = (b.lat - a.lat) * 111.32
    const dLng = (b.lng - a.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180)
    total += Math.hypot(dLat, dLng)
  }
  return Math.round(total * 1.25 * 10) / 10
}
