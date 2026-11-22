import { Link, useParams } from 'react-router-dom'
import { placesByIds, routeDistanceKm, routes } from '../data'
import { distanceMeters, formatDistance, formatMinutes, walkMinutes } from '../lib/geo'
import { useStore } from '../lib/store'
import { Icon } from '../icons'
import { CoverArt } from '../components/Cover'
import { MapView } from '../components/MapView'
import { NotFound } from './NotFound'

export function RouteDetail() {
  const { id = '' } = useParams()
  const route = routes.find((item) => item.id === id)
  const { checkinFor } = useStore()

  if (!route) return <NotFound />

  const stops = placesByIds(route.placeIds)
  const distance = routeDistanceKm(route)
  const mapsLink = `https://yandex.ru/maps/?rtext=${stops
    .map((place) => `${place.lat},${place.lng}`)
    .join('~')}&rtt=pd`

  const visited = stops.filter((place) => checkinFor(place.id)).length

  return (
    <>
      <div className="collection-hero">
        <div className="collection-hero__art">
          <CoverArt cover={route.cover} />
        </div>
        <div className="collection-hero__veil" />
        <Link to="/marshruty" className="collection-hero__nav icon-btn" aria-label="Все маршруты">
          <Icon name="close" size={18} />
        </Link>
        <div className="container collection-hero__inner">
          <span className="section-head__eyebrow">
            <Icon name="route" size={14} /> Маршрут
          </span>
          <h1>{route.title}</h1>
          <p className="collection-hero__desc">{route.description}</p>
          <div className="collection-meta">
            <span className="cover__chip">
              <Icon name="clock" size={13} /> {formatMinutes(route.durationMin)}
            </span>
            <span className="cover__chip">
              <Icon name="pin" size={13} /> {stops.length} точек
            </span>
            <span className="cover__chip">
              <Icon name="walk" size={13} /> {distance} км
            </span>
            <span className="cover__chip">
              <Icon name="check" size={13} /> {visited} из {stops.length} пройдено
            </span>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <a className="btn btn--wine" href={mapsLink} target="_blank" rel="noreferrer noopener">
              <Icon name="route" size={16} /> Открыть в Яндекс Картах
            </a>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="two-col">
          <div className="card">
            <div className="card__body">
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>Точки маршрута</h2>
              <ol className="route-timeline">
                {stops.map((place, index) => {
                  const next = stops[index + 1]
                  const leg = next ? distanceMeters(place, next) : 0
                  const checkin = checkinFor(place.id)
                  return (
                    <li className="route-stop" key={place.id}>
                      <span className="route-stop__num">{index + 1}</span>
                      <div className="route-stop__body">
                        <Link
                          to={`/mesta/${place.id}`}
                          className="route-stop__name"
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {place.shortName}
                        </Link>
                        <span className="meta">
                          <span className="meta__item">
                            <Icon name="pin" size={13} /> {place.address}
                          </span>
                          {checkin ? (
                            <span className="meta__item" style={{ color: 'var(--success)' }}>
                              <Icon name="check" size={13} /> отмечено
                            </span>
                          ) : null}
                        </span>
                        {next ? (
                          <span className="route-stop__leg">
                            <Icon name="walk" size={13} /> до следующей {formatDistance(leg)} ·{' '}
                            {formatMinutes(walkMinutes(leg))} пешком
                          </span>
                        ) : (
                          <span className="route-stop__leg" style={{ color: 'var(--success)' }}>
                            <Icon name="check" size={13} /> финиш маршрута
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          <div className="stack">
            <div className="map-card">
              <MapView places={stops} className="map-card__canvas" route={stops} interactive={false} />
            </div>
            <div className="aside-card">
              <span className="aside-card__title">Что учесть</span>
              <p className="muted" style={{ fontSize: 14 }}>
                Время указано без остановок на кофе и фото. Расстояния — по прямой, реальный путь
                пешком будет на 20–30% длиннее. Проверьте часы работы перед выходом.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
