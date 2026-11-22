import type { ReactNode } from 'react'
import type { Filters } from '../types'
import {
  budgetOptions,
  categoryOptions,
  companyOptions,
  durationOptions,
  moodOptions,
  themeOptions,
  timeOfDayOptions,
  transportOptions,
} from '../lib/filters'
import { categoryCounts } from '../data'

interface Props {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onReset: () => void
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function Group({
  title,
  children,
  onReset,
}: {
  title: string
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <div className="filters__group">
      <span className="filters__title">
        {title}
        {onReset ? (
          <button type="button" className="filters__reset" onClick={onReset}>
            сбросить
          </button>
        ) : null}
      </span>
      <div className="filters__options">{children}</div>
    </div>
  )
}

export function FiltersPanel({ filters, onChange, onReset }: Props) {
  return (
    <>
      <Group title="Тип места" onReset={() => onChange({ category: [] })}>
        {categoryOptions
          .filter((option) => categoryCounts[option.value])
          .map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={filters.category.includes(option.value)}
              onClick={() => onChange({ category: toggleValue(filters.category, option.value) })}
            >
              {option.label}
              <span className="chip__count">{categoryCounts[option.value]}</span>
            </button>
          ))}
      </Group>

      <Group title="Бюджет" onReset={() => onChange({ budget: [] })}>
        {budgetOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.budget.includes(option.value)}
            onClick={() => onChange({ budget: toggleValue(filters.budget, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Компания" onReset={() => onChange({ company: [] })}>
        {companyOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.company.includes(option.value)}
            onClick={() => onChange({ company: toggleValue(filters.company, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Сколько времени" onReset={() => onChange({ duration: [] })}>
        {durationOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.duration.includes(option.value)}
            onClick={() => onChange({ duration: toggleValue(filters.duration, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Настроение" onReset={() => onChange({ mood: [] })}>
        {moodOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.mood.includes(option.value)}
            onClick={() => onChange({ mood: toggleValue(filters.mood, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Тематика" onReset={() => onChange({ theme: [] })}>
        {themeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.theme.includes(option.value)}
            onClick={() => onChange({ theme: toggleValue(filters.theme, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Время суток" onReset={() => onChange({ timeOfDay: [] })}>
        {timeOfDayOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className="chip"
            aria-pressed={filters.timeOfDay.includes(option.value)}
            onClick={() => onChange({ timeOfDay: toggleValue(filters.timeOfDay, option.value) })}
          >
            {option.label}
          </button>
        ))}
      </Group>

      <Group title="Способ передвижения" onReset={() => onChange({ transport: [] })}>
        {transportOptions
          .filter((option) => option.value !== 'both')
          .map((option) => (
            <button
              key={option.value}
              type="button"
              className="chip"
              aria-pressed={filters.transport.includes(option.value)}
              onClick={() => onChange({ transport: toggleValue(filters.transport, option.value) })}
            >
              {option.label}
            </button>
          ))}
      </Group>

      <button type="button" className="btn btn--ghost btn--sm" onClick={onReset} style={{ marginTop: 10 }}>
        Сбросить все фильтры
      </button>
    </>
  )
}
