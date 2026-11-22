/**
 * Проверка демо-данных перед коммитом.
 * Запуск: npm run validate:data
 *
 * Ловит опечатки в enum, битые ссылки на id, координаты вне Новосибирска
 * и несоответствия в подборках/маршрутах/челленджах.
 */
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const seed = JSON.parse(
  readFileSync(new URL('../src/data/seed.json', import.meta.url), 'utf8'),
)

const CATEGORIES = [
  'museum', 'cafe', 'bar', 'park', 'viewpoint', 'art', 'sport',
  'theatre', 'zoo', 'quest', 'memorial', 'food', 'nature',
]
const THEMES = ['архитектура', 'история', 'арт', 'природа', 'еда']
const MOOD = ['поесть', 'культурно', 'активно', 'атмосферно']
const COMPANY = ['один', 'пара', 'с друзьями', 'с детьми']
const TIME = ['утро', 'день', 'вечер', 'ночь']
const BUDGET = ['free', 'upto500', '500to1500', 'over1500']
const DURATION = ['upto1h', '1to3h', 'halfday']
const TRANSPORT = ['walk', 'transport', 'both']
const PATTERNS = ['waves', 'grid', 'arcs', 'blobs', 'stripes', 'noise']

const errors = []
const warnings = []
const fail = (message) => errors.push(message)
const warn = (message) => warnings.push(message)

const isText = (value) => typeof value === 'string' && value.trim().length > 0
const isEnum = (value, allowed) => allowed.includes(value)
const inArray = (value, allowed) => Array.isArray(value) && value.length > 0 && value.every((item) => allowed.includes(item))

const topKeys = Object.keys(seed).sort().join(',')
if (topKeys !== 'challenges,collections,places,routes') {
  fail(`Верхний уровень должен содержать places, collections, routes, challenges. Сейчас: ${topKeys}`)
}

const places = Array.isArray(seed.places) ? seed.places : []
if (places.length < 1) fail('places пуст')

const ids = new Set()
for (const [index, place] of places.entries()) {
  const label = place.id ? `Место «${place.id}»` : `Место #${index}`
  if (!isText(place.id)) fail(`${label}: пустой id`)
  else if (ids.has(place.id)) fail(`${label}: id повторяется`)
  else ids.add(place.id)

  for (const field of ['name', 'shortName', 'type', 'address', 'hours', 'short', 'description', 'tips', 'bestTime', 'priceText', 'durationText']) {
    if (!isText(place[field])) fail(`${label}: поле ${field} пустое или не строка`)
  }

  if (!isEnum(place.category, CATEGORIES)) fail(`${label}: category = ${place.category}, допустимо: ${CATEGORIES.join(', ')}`)
  if (!isEnum(place.budget, BUDGET)) fail(`${label}: budget = ${place.budget}`)
  if (!isEnum(place.duration, DURATION)) fail(`${label}: duration = ${place.duration}`)
  if (!isEnum(place.transport, TRANSPORT)) fail(`${label}: transport = ${place.transport}`)
  if (!inArray(place.themes, THEMES)) fail(`${label}: themes должны быть из ${THEMES.join(', ')}`)
  if (!inArray(place.mood, MOOD)) fail(`${label}: mood должны быть из ${MOOD.join(', ')}`)
  if (!inArray(place.company, COMPANY)) fail(`${label}: company должны быть из ${COMPANY.join(', ')}`)
  if (!inArray(place.timeOfDay, TIME)) fail(`${label}: timeOfDay должны быть из ${TIME.join(', ')}`)

  if (typeof place.lat !== 'number' || place.lat < 54.7 || place.lat > 55.25) fail(`${label}: lat ${place.lat} вне Новосибирска`)
  if (typeof place.lng !== 'number' || place.lng < 82.5 || place.lng > 83.3) fail(`${label}: lng ${place.lng} вне Новосибирска`)
  if (typeof place.rating !== 'number' || place.rating < 0 || place.rating > 5) fail(`${label}: rating должен быть 0–5`)
  if (!Number.isInteger(place.uniqueness) || place.uniqueness < 1 || place.uniqueness > 10) fail(`${label}: uniqueness 1–10`)
  if (!Number.isInteger(place.popularity) || place.popularity < 0 || place.popularity > 100) fail(`${label}: popularity 0–100`)

  if (!place.cover || !isEnum(place.cover.pattern, PATTERNS)) fail(`${label}: cover.pattern должен быть из ${PATTERNS.join(', ')}`)
  if (!/^#[0-9a-f]{6}$/i.test(place.cover?.from ?? '') || !/^#[0-9a-f]{6}$/i.test(place.cover?.to ?? '')) {
    fail(`${label}: cover.from/to должны быть HEX-цветами`)
  }

  if (place.image !== undefined) {
    if (typeof place.image !== 'string' || !place.image.trim()) {
      fail(`${label}: image должно быть непустой строкой`)
    } else if (!/^(https?:)?\/\//i.test(place.image) && !place.image.startsWith('data:')) {
      const relative = place.image.replace(/^\.?\//, '')
      const file = fileURLToPath(new URL(`../public/${relative}`, import.meta.url))
      if (!existsSync(file)) fail(`${label}: фото не найдено — public/${relative}`)
    }
  }

  if (!Array.isArray(place.reviews) || place.reviews.length < 1) {
    warn(`${label}: нет отзывов — карточка покажет пустой блок`)
  }
  for (const review of place.reviews ?? []) {
    if (!isText(review.author)) fail(`${label}: у отзыва нет автора`)
    if (!isText(review.text)) fail(`${label}: у отзыва пустой текст`)
    if (typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5) fail(`${label}: рейтинг отзыва должен быть 1–5`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(review.date ?? '')) fail(`${label}: дата отзыва должна быть YYYY-MM-DD`)
  }
}

const checkRefs = (items, type) => {
  for (const item of items ?? []) {
    if (!isText(item.id)) fail(`${type}: пустой id`)
    for (const placeId of item.placeIds ?? []) {
      if (!ids.has(placeId)) fail(`${type} «${item.id}»: ссылка на несуществующее место «${placeId}»`)
    }
    if (!Array.isArray(item.placeIds) || item.placeIds.length === 0) fail(`${type} «${item.id}»: пустой placeIds`)
  }
}

checkRefs(seed.collections, 'Подборка')
checkRefs(seed.routes, 'Маршрут')
checkRefs(seed.challenges, 'Челлендж')

for (const collection of seed.collections ?? []) {
  if (collection.placesCount !== collection.placeIds.length) {
    warn(`Подборка «${collection.id}»: placesCount=${collection.placesCount}, а мест ${collection.placeIds.length}`)
  }
}

for (const route of seed.routes ?? []) {
  if (!['short', 'long'].includes(route.length)) fail(`Маршрут «${route.id}»: length должен быть short или long`)
  if (!Number.isFinite(route.durationMin) || route.durationMin <= 0) fail(`Маршрут «${route.id}»: durationMin`)
}

for (const challenge of seed.challenges ?? []) {
  if (!Number.isInteger(challenge.target) || challenge.target < 1) fail(`Челлендж «${challenge.id}»: target`)
  if (challenge.target > challenge.placeIds.length) {
    warn(`Челлендж «${challenge.id}»: target=${challenge.target} больше, чем мест (${challenge.placeIds.length}) — его нельзя закрыть`)
  }
}

const counts = (key, value) => places.filter((place) => place[key] === value).length
for (const budget of BUDGET) if (counts('budget', budget) < 2) warn(`Бюджет «${budget}»: всего ${counts('budget', budget)} мест — фильтр почти пустой`)
for (const duration of DURATION) if (counts('duration', duration) < 2) warn(`Длительность «${duration}»: всего ${counts('duration', duration)} мест`)

console.log(`\nМест: ${places.length}, подборок: ${seed.collections?.length ?? 0}, маршрутов: ${seed.routes?.length ?? 0}, челленджей: ${seed.challenges?.length ?? 0}`)

for (const warning of warnings) console.warn(`⚠️  ${warning}`)
if (errors.length) {
  for (const error of errors) console.error(`❌ ${error}`)
  console.error(`\nОшибок: ${errors.length}. Исправь seed.json и запусти проверку снова.\n`)
  process.exit(1)
}

console.log('✅ seed.json валиден\n')
