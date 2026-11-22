import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoryCounts, places } from '../data'
import type { Filters, SortMode } from '../types'
import {
  budgetOptions,
  categoryOptions,
  companyOptions,
  countActiveFilters,
  durationOptions,
  emptyFilters,
  filterPlaces,
  moodOptions,
  plural,
  themeOptions,
  timeOfDayOptions,
  transportOptions,
} from '../lib/filters'
import { distanceMeters, getPosition } from '../lib/geo'
import { useStore } from '../lib/store'
import { Icon } from '../icons'
import { FiltersPanel } from '../components/FiltersPanel'
import { PlaceCard } from '../components/PlaceCard'

const SORTS: { value: SortMode; label: string }[] = [
  { value: 'popular', label: 'Популярное' },
  { value: 'near', label: 'Рядом со мной' },
  { value: 'unusual', label: 'Небанальное' },
  { value: 'rating', label: 'По рейтингу' },
]

const labelOf = (
  list: { value: string; label: string }[],
  value: string,
): string => list.find((item) => item.value === value)?.label ?? value

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return []
  return raw
    .split(',')
    .filter((value): value is T => (allowed as readonly string[]).includes(value))
}

export function Places() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { notify, demoGeo } = useStore()
  const [filters, setFilters] = useState<Filters>(() => ({
    ...emptyFilters,
    budget: parseList(
      searchParams.get('budget'),
      budgetOptions.map((option) => option.value),
    ),
    company: parseList(
      searchParams.get('company'),
      companyOptions.map((option) => option.value),
    ),
    duration: parseList(
      searchParams.get('duration'),
      durationOptions.map((option) => option.value),
    ),
    mood: parseList(
      searchParams.get('mood'),
      moodOptions.map((option) => option.value),
    ),
    category: parseList(
      searchParams.get('category'),
      categoryOptions.map((option) => option.value),
    ),
    q: searchParams.get('q') ?? '',
    sort: (searchParams.get('sort') as SortMode | null) ?? 'popular',
  }))

  const [sheetOpen, setSheetOpen] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [geoBusy, setGeoBusy] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.budget.length) params.set('budget', filters.budget.join(','))
    if (filters.company.length) params.set('company', filters.company.join(','))
    if (filters.duration.length) params.set('duration', filters.duration.join(','))
    if (filters.mood.length) params.set('mood', filters.mood.join(','))
    if (filters.category.length) params.set('category', filters.category.join(','))
    if (filters.theme.length) params.set('theme', filters.theme.join(','))
    if (filters.timeOfDay.length) params.set('timeOfDay', filters.timeOfDay.join(','))
    if (filters.transport.length) params.set('transport', filters.transport.join(','))
    if (filters.q.trim()) params.set('q', filters.q.trim())
    if (filters.sort !== 'popular') params.set('sort', filters.sort)
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const distances = useMemo(() => {
    if (!userPos) return undefined
    return new Map(places.map((place) => [place.id, distanceMeters(userPos, place)]))
  }, [userPos])

  const results = useMemo(
    () => filterPlaces(places, filters, userPos, distances),
    [filters, userPos, distances],
  )

  const activeCount = countActiveFilters(filters)

  const patch = (next: Partial<Filters>) => setFilters((prev) => ({ ...prev, ...next }))
  const reset = () => setFilters({ ...emptyFilters })

  const requireNearby = async () => {
    if (userPos || geoBusy) return
    setGeoBusy(true)
    try {
      if (demoGeo) {
        setUserPos({ lat: 55.0302, lng: 82.9204 })
        return
      }
      const geo = await getPosition()
      setUserPos({ lat: geo.coords.latitude, lng: geo.coords.longitude })
    } catch {
      notify('Не удалось определить геопозицию — показываем по популярности', 'error')
      setFilters((prev) => ({ ...prev, sort: 'popular' }))
    } finally {
      setGeoBusy(false)
    }
  }

  const changeSort = (sort: SortMode) => {
    patch({ sort })
    if (sort === 'near') void requireNearby()
  }

  const activeChips: { key: string; label: string; clear: () => void }[] = [
    ...filters.category.map((value) => ({
      key: `cat-${value}`,
      label: labelOf(categoryOptions, value),
      clear: () => patch({ category: filters.category.filter((item) => item !== value) }),
    })),
    ...filters.budget.map((value) => ({
      key: `budget-${value}`,
      label: labelOf(budgetOptions, value),
      clear: () => patch({ budget: filters.budget.filter((item) => item !== value) }),
    })),
    ...filters.company.map((value) => ({
      key: `company-${value}`,
      label: labelOf(companyOptions, value),
      clear: () => patch({ company: filters.company.filter((item) => item !== value) }),
    })),
    ...filters.duration.map((value) => ({
      key: `duration-${value}`,
      label: labelOf(durationOptions, value),
      clear: () => patch({ duration: filters.duration.filter((item) => item !== value) }),
    })),
    ...filters.mood.map((value) => ({
      key: `mood-${value}`,
      label: labelOf(moodOptions, value),
      clear: () => patch({ mood: filters.mood.filter((item) => item !== value) }),
    })),
    ...filters.theme.map((value) => ({
      key: `theme-${value}`,
      label: labelOf(themeOptions, value),
      clear: () => patch({ theme: filters.theme.filter((item) => item !== value) }),
    })),
    ...filters.timeOfDay.map((value) => ({
      key: `time-${value}`,
      label: labelOf(timeOfDayOptions, value),
      clear: () => patch({ timeOfDay: filters.timeOfDay.filter((item) => item !== value) }),
    })),
    ...filters.transport.map((value) => ({
      key: `transport-${value}`,
      label: labelOf(transportOptions, value),
      clear: () => patch({ transport: filters.transport.filter((item) => item !== value) }),
    })),
  ]

  return (
    <div className="container catalog">
      <div className="catalog__head">
        <span className="section-head__eyebrow">
          <Icon name="pin" size={14} /> Каталог мест
        </span>
        <div className="catalog__title">
          <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 40px)' }}>Куда сходить в НСК</h1>
          <span className="muted" style={{ fontSize: 14 }}>
            {results.length} из {places.length}
          </span>
        </div>
        <p className="lead">
          Фильтруйте по бюджету, компании и настроению. Сортировка «рядом со мной» попросит
          доступ к геолокации — покажем, что в шаговой доступности.
        </p>
      </div>

      <div className="catalog__toolbar">
        <div className="catalog__toolbar-row">
          <label className="search">
            <span className="sr-only">Поиск по местам</span>
            <Icon name="search" size={18} className="search__icon" />
            <input
              className="input"
              type="search"
              value={filters.q}
              onChange={(event) => patch({ q: event.target.value })}
              placeholder="Место, тематика, адрес…"
            />
            {filters.q ? (
              <button
                type="button"
                className="search__clear"
                aria-label="Очистить поиск"
                onClick={() => patch({ q: '' })}
              >
                <Icon name="close" size={16} />
              </button>
            ) : null}
          </label>

          <select
            className="catalog__sort"
            value={filters.sort}
            onChange={(event) => changeSort(event.target.value as SortMode)}
            aria-label="Сортировка"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="filter-fab"
            onClick={() => setSheetOpen(true)}
            aria-label="Открыть фильтры"
          >
            <Icon name="filter" size={17} />
            Фильтры
            {activeCount ? <span className="filter-fab__count">{activeCount}</span> : null}
          </button>
        </div>

        <div className="chip-row">
          {categoryOptions
            .filter((option) => categoryCounts[option.value])
            .map((option) => (
              <button
                key={option.value}
                type="button"
                className="chip"
                aria-pressed={filters.category.includes(option.value)}
                onClick={() =>
                  patch({
                    category: filters.category.includes(option.value)
                      ? filters.category.filter((item) => item !== option.value)
                      : [...filters.category, option.value],
                  })
                }
              >
                {option.label}
                <span className="chip__count">{categoryCounts[option.value]}</span>
              </button>
            ))}
        </div>
      </div>

      <div className="catalog__layout">
        <aside className="filters" aria-label="Фильтры каталога">
          <FiltersPanel filters={filters} onChange={patch} onReset={reset} />
        </aside>

        <div>
          {activeChips.length ? (
            <div className="active-filters">
              {activeChips.map((chip) => (
                <span className="active-filters__tag" key={chip.key}>
                  {chip.label}
                  <button type="button" onClick={chip.clear} aria-label={`Убрать фильтр ${chip.label}`}>
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="filters__reset"
                onClick={reset}
                style={{ alignSelf: 'center' }}
              >
                сбросить всё
              </button>
            </div>
          ) : null}

          <div className="results-count">
            <span>
              Нашли <b>{results.length}</b> {plural(results.length, 'место', 'места', 'мест')}
              {filters.sort === 'near' && userPos ? ' · от вас по прямой' : null}
            </span>
            {filters.sort === 'near' && !userPos ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={requireNearby}
                disabled={geoBusy}
              >
                <Icon name="pin" size={14} /> {geoBusy ? 'Определяем…' : 'Разрешить геолокацию'}
              </button>
            ) : null}
          </div>

          {results.length ? (
            <div className="places-grid">
              {results.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <span className="empty__icon">
                <Icon name="search" size={24} />
              </span>
              <h2 className="empty__title">Ничего не нашлось</h2>
              <p className="muted" style={{ maxWidth: '46ch' }}>
                Слишком много фильтров сразу. Попробуйте убрать один-два — в каталоге точно есть
                что-то под ваш запрос.
              </p>
              <button type="button" className="btn btn--wine" onClick={reset}>
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>

      {sheetOpen ? (
        <div className="sheet" role="dialog" aria-modal="true" aria-label="Фильтры">
          <button
            type="button"
            className="sheet__backdrop"
            aria-label="Закрыть фильтры"
            onClick={() => setSheetOpen(false)}
          />
          <div className="sheet__panel">
            <div className="sheet__head">
              <span className="sheet__title">Фильтры</span>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSheetOpen(false)}
                aria-label="Закрыть"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="sheet__body">
              <FiltersPanel filters={filters} onChange={patch} onReset={reset} />
            </div>
            <div className="sheet__foot">
              <button type="button" className="btn btn--ghost" onClick={reset}>
                Сбросить
              </button>
              <button type="button" className="btn btn--wine" onClick={() => setSheetOpen(false)}>
                Показать {results.length}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
