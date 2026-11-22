import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { placeById, places, relatedPlaces } from '../data'
import { SITE } from '../config'
import type { Coords, GeoError } from '../lib/geo'
import { distanceMeters, formatDistance, getPosition } from '../lib/geo'
import { categoryMeta, plural } from '../lib/filters'
import { useStore } from '../lib/store'
import { api, newDeviceId } from '../lib/api'
import { imageUrl } from '../lib/media'
import { Icon } from '../icons'
import { CoverArt } from '../components/Cover'
import { FavoriteButton, Rating } from '../components/Rating'
import { MapView } from '../components/MapView'
import { PlaceCard } from '../components/PlaceCard'
import { NotFound } from './NotFound'

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PlaceDetail() {
  const { id = '' } = useParams()
  const place = placeById.get(id)
  const { demoGeo, addCheckin, checkinFor, reviews, addReview, name, notify, backend } = useStore()
  const [geoBusy, setGeoBusy] = useState(false)
  const [userPos, setUserPos] = useState<Coords | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState(name)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState('')
  const [heroFailed, setHeroFailed] = useState(false)
  const artRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const art = artRef.current
      if (!art) return
      const shift = Math.min(window.scrollY, 700) * 0.22
      art.style.transform = `translate3d(0, ${shift}px, 0) scale(1.06)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setFormName(name)
  }, [name])

  useEffect(() => {
    setHeroFailed(false)
  }, [place?.id])

  const checkin = place ? checkinFor(place.id) : undefined
  const localReviews = place ? (reviews[place.id] ?? []) : []
  const allReviews = useMemo(
    () => (place ? [...localReviews, ...place.reviews] : []),
    [place, localReviews],
  )
  const avgRating = allReviews.length
    ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
    : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: allReviews.filter((review) => Math.round(review.rating) === star).length,
  }))

  if (!place) return <NotFound />

  const cat = categoryMeta[place.category]
  const similar = relatedPlaces(place, 3)
  const mapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(`${place.address}, Новосибирск`)}`
  const routeLink = `https://yandex.ru/maps/?rtext=~${place.lat},${place.lng}&rtt=pd`

  const handleCheckin = async () => {
    if (geoBusy) return
    setGeoBusy(true)
    try {
      let position: Coords
      if (demoGeo) {
        position = { lat: place.lat + 0.0004, lng: place.lng - 0.0003 }
      } else {
        const geo = await getPosition()
        position = { lat: geo.coords.latitude, lng: geo.coords.longitude }
      }
      const meters = distanceMeters(position, { lat: place.lat, lng: place.lng })
      setUserPos(position)
      setDistance(meters)

      if (meters <= SITE.checkinRadius) {
        addCheckin({
          placeId: place.id,
          at: new Date().toISOString(),
          lat: position.lat,
          lng: position.lng,
          distance: Math.round(meters),
        })
        notify(
          demoGeo
            ? 'Демо-чек-ин засчитан. В реальном режиме нужна геолокация.'
            : 'Чек-ин засчитан — вы на месте!',
          'success',
        )
        if (backend === 'online' && !demoGeo) {
          api
            .checkin({
              placeId: place.id,
              lat: position.lat,
              lng: position.lng,
              deviceId: newDeviceId(),
            })
            .catch(() => undefined)
        }
      } else {
        notify(
          `Вы в ${formatDistance(meters)} от места. Нужно быть ближе ${SITE.checkinRadius} м.`,
          'error',
        )
      }
    } catch (error) {
      const geoError = error as GeoError
      notify(geoError.message ?? 'Не удалось определить местоположение', 'error')
    } finally {
      setGeoBusy(false)
    }
  }

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault()
    if (formText.trim().length < 10) {
      notify('Напишите хотя бы пару предложений', 'error')
      return
    }
    const review = {
      author: formName.trim() || 'Гость',
      rating: formRating,
      date: new Date().toISOString().slice(0, 10),
      text: formText.trim(),
      source: 'Вокруг НСК',
    }
    addReview(place.id, review)
    if (backend === 'online') {
      api
        .addReview(place.id, {
          author: review.author,
          rating: review.rating,
          text: review.text,
        })
        .catch(() => undefined)
    }
    setFormText('')
    setShowForm(false)
    notify('Спасибо! Отзыв добавлен', 'success')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, text: place.short, url })
      } else {
        await navigator.clipboard.writeText(url)
        notify('Ссылка скопирована', 'success')
      }
    } catch {
      /* пользователь отменил */
    }
  }

  const userPosition = userPos ?? (checkin ? { lat: checkin.lat, lng: checkin.lng } : null)

  return (
    <>
      <div className="place-hero">
        <div ref={artRef} className="place-hero__art">
          {place.image && !heroFailed ? (
            <img
              className="place-hero__photo"
              src={imageUrl(place.image)}
              alt={place.name}
              onError={() => setHeroFailed(true)}
            />
          ) : (
            <CoverArt cover={place.cover} />
          )}
        </div>
        <div className="place-hero__veil" />
        <div className="container place-hero__nav">
          <Link to="/mesta" className="icon-btn" aria-label="Назад к каталогу">
            <Icon name="chevron" size={18} style={{ transform: 'rotate(180deg)' }} />
          </Link>
          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="icon-btn" onClick={share} aria-label="Поделиться местом">
              <Icon name="share" size={18} />
            </button>
            <FavoriteButton placeId={place.id} />
          </div>
        </div>
        <div className="container place-hero__caption">
          <span className="place-hero__kicker">
            {cat.emoji} {place.type}
          </span>
          <h1 className="place-hero__title">{place.name}</h1>
        </div>
      </div>

      <div className="container">
        <div className="place-facts">
          <div className="fact">
            <span className="fact__label">
              <Icon name="wallet" size={12} /> Цена
            </span>
            <span className="fact__value">{place.priceText}</span>
          </div>
          <div className="fact">
            <span className="fact__label">
              <Icon name="clock" size={12} /> Длительность
            </span>
            <span className="fact__value">{place.durationText}</span>
          </div>
          <div className="fact">
            <span className="fact__label">
              <Icon name="sun" size={12} /> Когда лучше
            </span>
            <span className="fact__value">{place.bestTime}</span>
          </div>
          <div className="fact">
            <span className="fact__label">
              <Icon name="bus" size={12} /> Как добраться
            </span>
            <span className="fact__value">
              {place.transport === 'walk'
                ? 'Пешком'
                : place.transport === 'transport'
                  ? 'На транспорте'
                  : 'Пешком или на транспорте'}
            </span>
          </div>
        </div>

        <div className="place-layout">
          <div className="place-main">
            <section aria-labelledby="about-title">
              <div className="section-head" style={{ marginBottom: 12 }}>
                <h2 id="about-title" style={{ fontSize: 'clamp(20px, 2.6vw, 26px)' }}>
                  Почему стоит зайти
                </h2>
                <Rating value={place.rating} count={place.reviewsCount} />
              </div>
              <div className="prose">
                <p>{place.description}</p>
                <p>{place.short}</p>
              </div>
            </section>

            <div className="callout">
              <span className="callout__title">
                <Icon name="sparkles" size={13} /> Совет от местных
              </span>
              <p>{place.tips}</p>
            </div>

            <div>
              <span className="chips-label">
                <Icon name="compass" size={13} /> Тематика
              </span>
              <div className="tag-list">
                {place.themes.map((theme) => (
                  <span key={theme} className="tag">
                    {theme}
                  </span>
                ))}
                {place.mood.map((mood) => (
                  <span key={mood} className="tag">
                    {mood}
                  </span>
                ))}
                {place.company.map((company) => (
                  <span key={company} className="tag">
                    {company}
                  </span>
                ))}
              </div>
            </div>

            <section className="reviews" aria-labelledby="reviews-title">
              <div className="reviews__head">
                <div>
                  <h2 id="reviews-title" style={{ fontSize: 'clamp(20px, 2.6vw, 26px)' }}>
                    Отзывы гостей
                  </h2>
                  <p className="muted" style={{ fontSize: 13 }}>
                    {allReviews.length}{' '}
                    {plural(allReviews.length, 'отзыв', 'отзыва', 'отзывов')} · демо-выборка из
                    Яндекс Карт
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setShowForm((value) => !value)}
                >
                  <Icon name="star" size={15} />
                  {showForm ? 'Свернуть' : 'Оставить отзыв'}
                </button>
              </div>

              <div className="reviews__score">
                <div>
                  <div className="reviews__value">
                    {avgRating.toFixed(1).replace('.', ',')}
                    <small> / 5</small>
                  </div>
                  <div className="meta" style={{ marginTop: 4 }}>
                    {allReviews.length}{' '}
                    {plural(allReviews.length, 'оценка', 'оценки', 'оценок')}
                  </div>
                </div>
                <div className="rating-bars">
                  {distribution.map((item) => {
                    const percent = allReviews.length ? (item.count / allReviews.length) * 100 : 0
                    return (
                      <div className="rating-bar" key={item.star}>
                        <span>{item.star}</span>
                        <span className="rating-bar__track">
                          <span className="rating-bar__fill" style={{ width: `${percent}%` }} />
                        </span>
                        <span style={{ width: 22, textAlign: 'right' }}>{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {showForm ? (
                <form className="review-form" onSubmit={submitReview}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <span className="chips-label" style={{ margin: 0 }}>
                      Ваша оценка
                    </span>
                    <div className="star-picker" role="radiogroup" aria-label="Оценка">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={formRating === star}
                          aria-label={`${star} из 5`}
                          className={star <= formRating ? 'is-on' : ''}
                          onClick={() => setFormRating(star)}
                        >
                          <Icon name="star" size={22} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="field">
                    <span className="field__label">Имя</span>
                    <input
                      className="input"
                      value={formName}
                      onChange={(event) => setFormName(event.target.value)}
                      placeholder="Как вас зовут?"
                      maxLength={40}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Отзыв</span>
                    <textarea
                      className="textarea"
                      value={formText}
                      onChange={(event) => setFormText(event.target.value)}
                      placeholder="Что понравилось, что учесть другим гостям?"
                      maxLength={600}
                    />
                  </label>
                  <div className="row">
                    <button type="submit" className="btn btn--wine btn--sm">
                      Опубликовать
                    </button>
                    <span className="muted" style={{ fontSize: 12 }}>
                      Отзыв сохранится в вашем профиле
                    </span>
                  </div>
                </form>
              ) : null}

              <div className="review-list">
                {allReviews.slice(0, 8).map((review) => (
                  <article className="review" key={review.id}>
                    <div className="review__head">
                      <span className="review__avatar" aria-hidden="true">
                        {review.author.trim().charAt(0).toUpperCase() || 'Г'}
                      </span>
                      <div>
                        <div className="review__name">{review.author}</div>
                        <div className="review__date">{formatDate(review.date)}</div>
                      </div>
                      {review.source ? <span className="review__source">{review.source}</span> : null}
                    </div>
                    <Rating value={review.rating} />
                    <p className="review__text">{review.text}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="place-aside">
            <div className="checkin-box" id="checkin">
              <span className="checkin-box__title">
                <Icon name="pin" size={17} />
                {checkin ? 'Вы были здесь' : 'Отметьтесь на месте'}
              </span>
              {checkin ? (
                <>
                  <p className="checkin-box__text">
                    Чек-ин засчитан {formatDateTime(checkin.at)} ·{' '}
                    {formatDistance(checkin.distance)} от точки.
                  </p>
                  <Link to="/chellendzhi" className="btn btn--milk btn--sm">
                    <Icon name="trophy" size={15} /> К челленджам
                  </Link>
                </>
              ) : (
                <>
                  <p className="checkin-box__text">
                    Чтобы прогресс челленджа зачёлся, нужно быть в радиусе{' '}
                    {SITE.checkinRadius} м. Геопозицию проверяет сайт — обмануть нельзя.
                  </p>
                  <button
                    type="button"
                    className="btn btn--milk btn--sm"
                    onClick={handleCheckin}
                    disabled={geoBusy}
                  >
                    <Icon name="pin" size={15} />
                    {geoBusy ? 'Определяем…' : 'Я здесь — отметиться'}
                  </button>
                </>
              )}
              {distance !== null && checkin ? null : distance !== null ? (
                <span className="checkin-state">
                  <Icon name="walk" size={14} /> До места: {formatDistance(distance)}
                </span>
              ) : null}
              {demoGeo ? (
                <span style={{ fontSize: 11.5, opacity: 0.75 }}>
                  Демо-режим геолокации включён в профиле
                </span>
              ) : null}
            </div>

            <div className="aside-card">
              <span className="aside-card__title">Адрес и маршрут</span>
              <span className="meta__item">
                <Icon name="pin" size={15} /> {place.address}
              </span>
              <span className="meta__item">
                <Icon name="clock" size={15} /> {place.hours}
              </span>
              <div className="row" style={{ gap: 8 }}>
                <a
                  className="btn btn--ghost btn--sm"
                  href={routeLink}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="route" size={15} /> Маршрут
                </a>
                <a
                  className="btn btn--ghost btn--sm"
                  href={mapsLink}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="map" size={15} /> Яндекс Карты
                </a>
              </div>
              <div className="map-card map-card--sm">
                <MapView
                  places={[place]}
                  className="map-card__canvas"
                  userPosition={userPosition}
                  interactive={false}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {similar.length ? (
        <section className="container section" aria-labelledby="similar-title">
          <div className="section-head">
            <div>
              <span className="section-head__eyebrow">
                <Icon name="compass" size={14} /> Рядом по духу
              </span>
              <h2 id="similar-title">Похожие места</h2>
            </div>
            <Link to="/mesta" className="section-head__link">
              Весь каталог <Icon name="arrow" size={15} />
            </Link>
          </div>
          <div className="places-grid">
            {similar.map((item) => (
              <PlaceCard key={item.id} place={item} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="container muted" style={{ fontSize: 12, paddingBottom: 12 }}>
        Всего в каталоге {places.length} мест. Данные о местах — демо-набор для проекта «Вокруг НСК».
      </p>
    </>
  )
}
