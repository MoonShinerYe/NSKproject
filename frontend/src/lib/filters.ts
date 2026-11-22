import type { Category, Filters, Place, Theme, Budget, Company, Duration, Mood, Transport, TimeOfDay } from '../types'

export const categoryMeta: Record<Category, { label: string; icon: string; emoji: string }> = {
  museum: { label: 'Музей', icon: 'museum', emoji: '🏛️' },
  cafe: { label: 'Кофейня', icon: 'coffee', emoji: '☕' },
  bar: { label: 'Бар', icon: 'coffee', emoji: '🍷' },
  park: { label: 'Парк', icon: 'park', emoji: '🌳' },
  viewpoint: { label: 'Смотровая', icon: 'camera', emoji: '🔭' },
  art: { label: 'Арт-пространство', icon: 'camera', emoji: '🎨' },
  sport: { label: 'Спорт', icon: 'ticket', emoji: '🏒' },
  theatre: { label: 'Театр', icon: 'ticket', emoji: '🎭' },
  zoo: { label: 'Зоопарк', icon: 'park', emoji: '🦌' },
  quest: { label: 'Квест', icon: 'compass', emoji: '🧭' },
  memorial: { label: 'Легенда', icon: 'pin', emoji: '🕯️' },
  food: { label: 'Еда', icon: 'coffee', emoji: '🍔' },
  nature: { label: 'Природа', icon: 'park', emoji: '🌿' },
}

export const budgetOptions: { value: Budget; label: string }[] = [
  { value: 'free', label: 'Бесплатно' },
  { value: 'upto500', label: 'До 500 ₽' },
  { value: '500to1500', label: '500–1500 ₽' },
  { value: 'over1500', label: 'От 1500 ₽' },
]

export const companyOptions: { value: Company; label: string }[] = [
  { value: 'один', label: 'Один' },
  { value: 'пара', label: 'Парой' },
  { value: 'с друзьями', label: 'С друзьями' },
  { value: 'с детьми', label: 'С детьми' },
]

export const durationOptions: { value: Duration; label: string }[] = [
  { value: 'upto1h', label: 'До часа' },
  { value: '1to3h', label: '1–3 часа' },
  { value: 'halfday', label: 'Полдня' },
]

export const moodOptions: { value: Mood; label: string }[] = [
  { value: 'поесть', label: 'Поесть' },
  { value: 'культурно', label: 'Культурно' },
  { value: 'активно', label: 'Активно' },
  { value: 'атмосферно', label: 'Атмосферно' },
]

export const timeOfDayOptions: { value: TimeOfDay; label: string }[] = [
  { value: 'утро', label: 'Утром' },
  { value: 'день', label: 'Днём' },
  { value: 'вечер', label: 'Вечером' },
  { value: 'ночь', label: 'Ночью' },
]

export const transportOptions: { value: Transport; label: string }[] = [
  { value: 'walk', label: 'Пешком' },
  { value: 'transport', label: 'На транспорте' },
  { value: 'both', label: 'Любой способ' },
]

export const themeOptions: { value: Theme; label: string }[] = [
  { value: 'архитектура', label: 'Архитектура' },
  { value: 'история', label: 'История' },
  { value: 'арт', label: 'Арт' },
  { value: 'природа', label: 'Природа' },
  { value: 'еда', label: 'Еда' },
]

export const categoryOptions: { value: Category; label: string }[] = (
  Object.keys(categoryMeta) as Category[]
).map((value) => ({ value, label: categoryMeta[value].label }))

export const emptyFilters: Filters = {
  budget: [],
  company: [],
  duration: [],
  category: [],
  theme: [],
  timeOfDay: [],
  transport: [],
  mood: [],
  q: '',
  sort: 'popular',
}

const textFields = (p: Place) =>
  [p.name, p.shortName, p.type, p.short, p.description, p.address, ...p.themes, ...p.mood]
    .join(' ')
    .toLowerCase()

/** Применяет фильтры каталога; nearby-сортировка требует координат пользователя. */
export function filterPlaces(
  list: Place[],
  f: Filters,
  userPos?: { lat: number; lng: number } | null,
  distances?: Map<string, number>,
): Place[] {
  const q = f.q.trim().toLowerCase()
  const result = list.filter((p) => {
    if (f.budget.length && !f.budget.includes(p.budget)) return false
    if (f.company.length && !p.company.some((c) => f.company.includes(c))) return false
    if (f.duration.length && !f.duration.includes(p.duration)) return false
    if (f.category.length && !f.category.includes(p.category)) return false
    if (f.theme.length && !p.themes.some((t) => f.theme.includes(t))) return false
    if (f.timeOfDay.length && !p.timeOfDay.some((t) => f.timeOfDay.includes(t))) return false
    if (f.transport.length && !f.transport.some((mode) => mode === p.transport || p.transport === 'both'))
      return false
    if (f.mood.length && !p.mood.some((m) => f.mood.includes(m))) return false
    if (q && !textFields(p).includes(q)) return false
    return true
  })

  return sortPlaces(result, f.sort, userPos, distances)
}

export function sortPlaces(
  list: Place[],
  sort: Filters['sort'],
  userPos?: { lat: number; lng: number } | null,
  distances?: Map<string, number>,
): Place[] {
  const copy = [...list]
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
    case 'unusual':
      return copy.sort((a, b) => b.uniqueness - a.uniqueness || b.rating - a.rating)
    case 'near':
      if (!userPos || !distances) return copy.sort((a, b) => b.popularity - a.popularity)
      return copy.sort(
        (a, b) => (distances.get(a.id) ?? Infinity) - (distances.get(b.id) ?? Infinity),
      )
    case 'popular':
    default:
      return copy.sort((a, b) => b.popularity - a.popularity || b.rating - a.rating)
  }
}

export function countActiveFilters(f: Filters): number {
  return (
    f.budget.length +
    f.company.length +
    f.duration.length +
    f.category.length +
    f.theme.length +
    f.timeOfDay.length +
    f.transport.length +
    f.mood.length +
    (f.q.trim() ? 1 : 0)
  )
}

export function pickRandom<T>(list: T[], count: number): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few
  return many
}
