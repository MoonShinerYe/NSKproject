import { useState } from 'react'
import { Link } from 'react-router-dom'
import { routeDistanceKm, routes } from '../data'
import type { Route } from '../types'
import { formatMinutes } from '../lib/geo'
import { plural } from '../lib/filters'
import { Icon } from '../icons'
import { CoverArt } from '../components/Cover'

function RouteCard({ route }: { route: Route }) {
  const distance = routeDistanceKm(route)
  const count = route.placeIds.length
  return (
    <Link to={`/marshruty/${route.id}`} className="route-card">
      <div className="route-card__cover">
        <CoverArt cover={route.cover} />
      </div>
      <div className="route-card__body">
        <span className="badge badge--heavenly">{route.length === 'short' ? 'Короткий' : 'На весь день'}</span>
        <span className="route-card__title">{route.title}</span>
        <span className="route-card__meta">
          <span>
            <Icon name="pin" size={12} /> {count} {plural(count, 'точка', 'точки', 'точек')}
          </span>
          <span>
            <Icon name="clock" size={12} /> {formatMinutes(route.durationMin)}
          </span>
          <span>
            <Icon name="walk" size={12} /> {distance} км
          </span>
        </span>
      </div>
    </Link>
  )
}

export function RoutesPage() {
  const [length, setLength] = useState<'short' | 'long'>('short')
  const list = routes.filter((route) => route.length === length)

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div className="catalog__head">
        <span className="section-head__eyebrow">
          <Icon name="route" size={14} /> Маршруты
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 40px)' }}>Прогулки по городу</h1>
        <p className="lead">
          Короткие маршруты на 1,5 часа и длинные на полдня. Точки собраны так, чтобы не мотаться
          через город: идёте от одной к другой.
        </p>
      </div>

      <div className="segmented" role="tablist" aria-label="Длина маршрута">
        <button
          type="button"
          role="tab"
          aria-selected={length === 'short'}
          className={`segmented__btn ${length === 'short' ? 'segmented__btn--active' : ''}`}
          onClick={() => setLength('short')}
        >
          До 1,5 часа
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={length === 'long'}
          className={`segmented__btn ${length === 'long' ? 'segmented__btn--active' : ''}`}
          onClick={() => setLength('long')}
        >
          На полдня
        </button>
      </div>

      <div className="route-list" style={{ marginTop: 18 }}>
        {list.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>

      <div className="two-col section">
        <div className="aside-card">
          <span className="aside-card__title">Как это работает</span>
          <p className="muted" style={{ fontSize: 14 }}>
            Каждый маршрут — последовательность точек с координатами. На карте маршрута видно
            расстояние между остановками, а в карточке точки есть пешеходная ссылка на Яндекс
            Карты.
          </p>
        </div>
        <div className="aside-card">
          <span className="aside-card__title">Совет</span>
          <p className="muted" style={{ fontSize: 14 }}>
            Начните с короткого маршрута в первый день, а длинный оставьте на выходные. В
            Академгородок закладывайте дорогу отдельно — это другой берег.
          </p>
        </div>
      </div>

      <p className="muted" style={{ fontSize: 12 }}>
        В базе {routes.length} маршрутов. Все они доступны офлайн после первого открытия.
      </p>
    </div>
  )
}
