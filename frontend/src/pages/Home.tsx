import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collections, places, popularPlaces, stats } from '../data'
import type { Budget, Company, Duration, Mood } from '../types'
import {
  budgetOptions,
  companyOptions,
  durationOptions,
  moodOptions,
  pickRandom,
  plural,
} from '../lib/filters'
import { Icon } from '../icons'
import { CitySkyline } from '../components/CitySkyline'
import { CollectionCard } from '../components/CollectionCard'
import { MapView } from '../components/MapView'
import { PlaceCard } from '../components/PlaceCard'
import { Randomizer } from '../components/Randomizer'
import { SocialLinks } from '../components/SocialLinks'

const STEPS = [
  {
    icon: 'camera' as const,
    title: 'Наведите камеру',
    text: 'QR-код в номере отеля или на ресепшене — и гид уже открыт. Без установки и регистрации.',
  },
  {
    icon: 'compass' as const,
    title: 'Выберите настроение',
    text: 'Бюджет, компания, время и настроение. Фильтры подберут 3–5 мест, а не весь каталог.',
  },
  {
    icon: 'pin' as const,
    title: 'Отметьтесь на месте',
    text: 'Геолокация подтверждает, что вы действительно пришли. Без геолокации прогресс не зачтётся.',
  },
  {
    icon: 'gift' as const,
    title: 'Заберите приз',
    text: 'Собирайте челленджи и получайте кофе, билеты и скидки от партнёров проекта.',
  },
]

export function Home() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)

  const [budget, setBudget] = useState<Budget[]>([])
  const [company, setCompany] = useState<Company[]>([])
  const [duration, setDuration] = useState<Duration[]>([])
  const [mood, setMood] = useState<Mood[]>([])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const hero = heroRef.current
        if (!hero) return
        hero.style.setProperty('--p', String(Math.min(window.scrollY, 900)))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  const matching = useMemo(
    () =>
      places.filter(
        (place) =>
          (!budget.length || budget.includes(place.budget)) &&
          (!company.length || place.company.some((c) => company.includes(c))) &&
          (!duration.length || duration.includes(place.duration)) &&
          (!mood.length || place.mood.some((m) => mood.includes(m))),
      ),
    [budget, company, duration, mood],
  )

  const activeCount = budget.length + company.length + duration.length + mood.length
  const teaserPlaces = useMemo(() => popularPlaces.slice(0, 6), [])
  const featured = useMemo(() => pickRandom(places, 3), [])
  const mapPlaces = useMemo(() => places.filter((p) => p.popularity > 55).slice(0, 26), [])

  const openCatalog = () => {
    const params = new URLSearchParams()
    if (budget.length) params.set('budget', budget.join(','))
    if (company.length) params.set('company', company.join(','))
    if (duration.length) params.set('duration', duration.join(','))
    if (mood.length) params.set('mood', mood.join(','))
    navigate(`/mesta${params.size ? `?${params.toString()}` : ''}`)
  }

  const toggle = <T,>(list: T[], value: T, set: (next: T[]) => void) => {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  return (
    <>
      <div className="hero" ref={heroRef}>
        <div className="hero__layers" aria-hidden="true">
          <div className="hero__blob" />
          <div className="hero__rings" />
          <div className="hero__sun" />
          <CitySkyline className="hero__skyline" />
        </div>

        <div className="container">
          <div className="hero__inner">
            <span className="hero__eyebrow">
              <span className="hero__eyebrow-dot">
                <Icon name="pin" size={11} />
              </span>
              {stats.places} мест · подборки · маршруты
            </span>

            <h1 className="hero__title">
              Вы в Новосибирске?
              <br />
              Вот что стоит <em>увидеть</em>
            </h1>

            <p className="hero__lead">
              Небанальные места, которые не покажут в стандартной экскурсии: от чёрдака
              краеведческого музея до бара в бывшем бомбоубежище. Откройте город заново — за пару
              часов или за целый день.
            </p>

            <div className="hero__cta">
              <Link to="/mesta" className="btn btn--wine">
                <Icon name="compass" size={18} />
                Куда сходить?
              </Link>
              <Link to="/podborki" className="btn btn--ghost">
                Готовые подборки
              </Link>
            </div>

            <div className="hero__stats">
              <div className="hero__stat">
                <b>{stats.places}</b>
                <span>проверенных мест</span>
              </div>
              <div className="hero__stat">
                <b>{stats.collections}</b>
                <span>подборок под ситуацию</span>
              </div>
              <div className="hero__stat">
                <b>{stats.routes}</b>
                <span>маршрутов по городу</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="quick" id="quick">
          <div className="quick__head">
            <span className="quick__title">
              <Icon name="filter" size={18} /> Подберите под себя
            </span>
            <span className="quick__hint">можно выбрать несколько</span>
          </div>

          <div className="quick__grid">
            <div className="quick__group">
              <span className="quick__label">
                <Icon name="wallet" size={13} /> Бюджет
              </span>
              <div className="chip-row">
                {budgetOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip"
                    aria-pressed={budget.includes(option.value)}
                    onClick={() => toggle(budget, option.value, setBudget)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="quick__group">
              <span className="quick__label">
                <Icon name="users" size={13} /> Компания
              </span>
              <div className="chip-row">
                {companyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip"
                    aria-pressed={company.includes(option.value)}
                    onClick={() => toggle(company, option.value, setCompany)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="quick__group">
              <span className="quick__label">
                <Icon name="clock" size={13} /> Сколько времени
              </span>
              <div className="chip-row">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip"
                    aria-pressed={duration.includes(option.value)}
                    onClick={() => toggle(duration, option.value, setDuration)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="quick__group">
              <span className="quick__label">
                <Icon name="sparkles" size={13} /> Настроение
              </span>
              <div className="chip-row">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className="chip"
                    aria-pressed={mood.includes(option.value)}
                    onClick={() => toggle(mood, option.value, setMood)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="quick__actions">
            <button type="button" className="btn btn--wine" onClick={openCatalog}>
              Показать места
              <Icon name="arrow" size={16} />
            </button>
            <span className="quick__meta">
              {activeCount === 0 ? (
                <>Выберите хотя бы один параметр — или смотрите весь каталог</>
              ) : (
                <>
                  Подходит <b>{matching.length}</b>{' '}
                  {plural(matching.length, 'место', 'места', 'мест')}
                </>
              )}
            </span>
            {activeCount > 0 ? (
              <button
                type="button"
                className="quick__reset"
                onClick={() => {
                  setBudget([])
                  setCompany([])
                  setDuration([])
                  setMood([])
                }}
                style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--wine)', fontWeight: 600 }}
              >
                Сбросить
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <Randomizer places={places} />

      <section className="container section" aria-labelledby="collections-title">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">
              <Icon name="compass" size={14} /> Подборки
            </span>
            <h2 id="collections-title">Готовые сценарии прогулки</h2>
          </div>
          <Link to="/podborki" className="section-head__link">
            Все подборки <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="collections-scroll">
          {collections.slice(0, 4).map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="container section" aria-labelledby="popular-title">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">
              <Icon name="heart" size={14} /> Выбор гостей
            </span>
            <h2 id="popular-title">Популярное у туристов</h2>
          </div>
          <Link to="/mesta?sort=popular" className="section-head__link">
            Весь каталог <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="places-grid">
          {teaserPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <section className="container section" aria-labelledby="map-title">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">
              <Icon name="map" size={14} /> На карте
            </span>
            <h2 id="map-title">Где это всё находится</h2>
          </div>
          <Link to="/mesta" className="section-head__link">
            Открыть каталог <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="map-card">
          <MapView places={mapPlaces} className="map-card" />
          <div className="map-card__overlay">
            <span className="cover__chip">● {mapPlaces.length} мест в центре</span>
            <span className="cover__chip">Масштабируйте карту</span>
          </div>
        </div>
      </section>

      <section className="container section" aria-labelledby="steps-title">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">
              <Icon name="route" size={14} /> Как это работает
            </span>
            <h2 id="steps-title">Четыре шага до впечатлений</h2>
          </div>
        </div>
        <ol className="steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="step">
              <span className="step__num">{String(index + 1).padStart(2, '0')}</span>
              <span className="step__icon">
                <Icon name={step.icon} size={19} />
              </span>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container section" aria-labelledby="featured-title">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">
              <Icon name="sparkles" size={14} /> Небанальное
            </span>
            <h2 id="featured-title">Три находки на сегодня</h2>
          </div>
        </div>
        <div className="places-grid">
          {featured.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      <SocialLinks />

      <section className="container section">
        <div className="cta-band">
          <div>
            <h2 className="cta-band__title">Начните с челленджа</h2>
            <p className="cta-band__text">
              Отметьтесь в 10 местах за поездку — и получите кофе от партнёров. Геолокация
              подтвердит, что вы правда там были.
            </p>
          </div>
          <Link to="/chellendzhi" className="btn btn--milk">
            <Icon name="trophy" size={17} />
            К челленджам
          </Link>
        </div>
      </section>
    </>
  )
}
