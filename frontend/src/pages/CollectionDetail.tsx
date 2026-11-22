import { Link, useParams } from 'react-router-dom'
import { collections, placesByIds } from '../data'
import { plural } from '../lib/filters'
import { Icon } from '../icons'
import { CoverArt } from '../components/Cover'
import { PlaceCard } from '../components/PlaceCard'
import { NotFound } from './NotFound'

export function CollectionDetail() {
  const { id = '' } = useParams()
  const collection = collections.find((item) => item.id === id)

  if (!collection) return <NotFound />

  const collectionPlaces = placesByIds(collection.placeIds)
  const mapsRoute = collectionPlaces.length
    ? `https://yandex.ru/maps/?rtext=${collectionPlaces
        .slice(0, 10)
        .map((place) => `${place.lat},${place.lng}`)
        .join('~')}&rtt=pd`
    : undefined

  return (
    <>
      <div className="collection-hero">
        <div className="collection-hero__art">
          <CoverArt cover={collection.cover} />
        </div>
        <div className="collection-hero__veil" />
        <Link to="/podborki" className="collection-hero__nav icon-btn" aria-label="Все подборки">
          <Icon name="close" size={18} />
        </Link>
        <div className="container collection-hero__inner">
          <span className="section-head__eyebrow">
            <Icon name="compass" size={14} /> Подборка
          </span>
          <h1>{collection.title}</h1>
          <p className="collection-hero__desc">{collection.description}</p>
          <div className="collection-meta">
            <span className="cover__chip">
              <Icon name="clock" size={13} /> {collection.duration}
            </span>
            <span className="cover__chip">
              <Icon name="pin" size={13} /> {collectionPlaces.length}{' '}
              {plural(collectionPlaces.length, 'место', 'места', 'мест')}
            </span>
            <span className="cover__chip">
              <Icon name="wallet" size={13} /> {collection.subtitle}
            </span>
          </div>
          <div className="row" style={{ marginTop: 18 }}>
            <Link to="/mesta" className="btn btn--wine">
              <Icon name="pin" size={16} /> Все места
            </Link>
            {mapsRoute ? (
              <a
                className="btn btn--ghost"
                href={mapsRoute}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="route" size={16} /> Маршрут в Яндекс Картах
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="places-grid">
          {collectionPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </div>

      <div className="container section">
        <div className="cta-band">
          <div>
            <h2 className="cta-band__title">Отмечайтесь по пути</h2>
            <p className="cta-band__text">
              Каждое посещённое место из подборки приближает к призу — прогресс виден в профиле и в
              челленджах.
            </p>
          </div>
          <Link to="/chellendzhi" className="btn btn--milk">
            <Icon name="trophy" size={16} /> Челленджи
          </Link>
        </div>
      </div>
    </>
  )
}
