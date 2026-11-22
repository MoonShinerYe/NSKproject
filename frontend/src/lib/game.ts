import type { Challenge, Checkin, Place } from '../types'
import { placesByIds, routes } from '../data'

export function checkedInIds(checkins: Checkin[]): Set<string> {
  return new Set(checkins.map((checkin) => checkin.placeId))
}

export function challengeProgress(challenge: Challenge, ids: Set<string>): number {
  return challenge.placeIds.filter((id) => ids.has(id)).length
}

export function isChallengeDone(challenge: Challenge, ids: Set<string>): boolean {
  return challengeProgress(challenge, ids) >= challenge.target
}

/** Детерминированный промокод — чтобы приз выглядел «настоящим» и не менялся при перезагрузке. */
export function promoCode(challengeId: string): string {
  let hash = 7
  for (let i = 0; i < challengeId.length; i += 1) {
    hash = (hash * 31 + challengeId.charCodeAt(i)) % 9999
  }
  return `NSK-${String(hash).padStart(4, '0')}`
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: 'trophy' | 'pin' | 'heart' | 'star' | 'gift' | 'camera' | 'coffee' | 'moon'
  unlocked: boolean
}

export function achievements(
  checkins: Checkin[],
  favorites: string[],
  reviewCount: number,
  doneChallenges: number,
): Achievement[] {
  const ids = checkedInIds(checkins)
  const checkedPlaces = [...ids]
    .map((id) => placesByIds([id])[0])
    .filter((place): place is Place => Boolean(place))

  const parkCount = checkedPlaces.filter((place) =>
    ['park', 'nature', 'zoo'].includes(place.category),
  ).length
  const foodCount = checkedPlaces.filter((place) =>
    ['cafe', 'bar', 'food'].includes(place.category),
  ).length
  const nightCount = checkedPlaces.filter((place) => place.timeOfDay.includes('ночь')).length
  const routeDone = routes.some((route) =>
    route.placeIds.length > 0 && route.placeIds.every((id) => ids.has(id)),
  )

  return [
    {
      id: 'first',
      title: 'Первый шаг',
      description: 'Первый чек-ин на месте',
      icon: 'pin',
      unlocked: checkins.length >= 1,
    },
    {
      id: 'five',
      title: 'Пять точек',
      description: 'Отмечено 5 мест',
      icon: 'star',
      unlocked: checkins.length >= 5,
    },
    {
      id: 'ten',
      title: 'Десятка',
      description: 'Отмечено 10 мест',
      icon: 'trophy',
      unlocked: checkins.length >= 10,
    },
    {
      id: 'collector',
      title: 'Коллекционер',
      description: '5 мест в избранном',
      icon: 'heart',
      unlocked: favorites.length >= 5,
    },
    {
      id: 'gourmet',
      title: 'Гурман',
      description: '3 гастро-точки',
      icon: 'coffee',
      unlocked: foodCount >= 3,
    },
    {
      id: 'parks',
      title: 'Парковый житель',
      description: '5 парков и природных мест',
      icon: 'camera',
      unlocked: parkCount >= 5,
    },
    {
      id: 'night',
      title: 'Ночной НСК',
      description: 'Чек-ин в месте «ночного» формата',
      icon: 'moon',
      unlocked: nightCount >= 1,
    },
    {
      id: 'critic',
      title: 'Критик',
      description: '3 отзыва о местах',
      icon: 'star',
      unlocked: reviewCount >= 3,
    },
    {
      id: 'route',
      title: 'Маршрут пройден',
      description: 'Все точки одного маршрута',
      icon: 'gift',
      unlocked: routeDone,
    },
    {
      id: 'challenge',
      title: 'Челлендж закрыт',
      description: 'Хотя бы один челлендж завершён',
      icon: 'trophy',
      unlocked: doneChallenges >= 1,
    },
  ]
}
