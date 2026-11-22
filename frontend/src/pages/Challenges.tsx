import { useMemo, useState } from 'react'
import { challenges, placesByIds, stats } from '../data'
import { SITE } from '../config'
import type { Coords, GeoError } from '../lib/geo'
import { distanceMeters, formatDistance, getPosition } from '../lib/geo'
import { challengeProgress, checkedInIds, isChallengeDone, promoCode } from '../lib/game'
import { useStore } from '../lib/store'
import { Icon } from '../icons'
import { NotFound } from './NotFound'

export function Challenges() {
  const { checkins, addCheckin, demoGeo, notify } = useStore()
  const [userPos, setUserPos] = useState<Coords | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [geoBusy, setGeoBusy] = useState(false)

  const ids = useMemo(() => checkedInIds(checkins), [checkins])
  const doneCount = challenges.filter((challenge) => isChallengeDone(challenge, ids)).length

  const locate = async () => {
    if (userPos || geoBusy) return
    setGeoBusy(true)
    try {
      if (demoGeo) {
        setUserPos({ lat: 55.0302, lng: 82.9204 })
        return
      }
      const geo = await getPosition()
      setUserPos({ lat: geo.coords.latitude, lng: geo.coords.longitude })
    } catch (error) {
      notify((error as GeoError).message ?? 'Геолокация недоступна', 'error')
    } finally {
      setGeoBusy(false)
    }
  }

  const checkin = async (placeId: string) => {
    const place = placesByIds([placeId])[0]
    if (!place || busyId) return
    setBusyId(placeId)
    try {
      let position: Coords
      if (demoGeo) {
        position = { lat: place.lat + 0.0004, lng: place.lng - 0.0003 }
      } else {
        const geo = await getPosition()
        position = { lat: geo.coords.latitude, lng: geo.coords.longitude }
      }
      setUserPos(position)
      const meters = distanceMeters(position, place)
      if (meters > SITE.checkinRadius) {
        notify(
          `Вы в ${formatDistance(meters)} от «${place.shortName}». Нужно быть ближе ${SITE.checkinRadius} м.`,
          'error',
        )
        return
      }
      addCheckin({
        placeId,
        at: new Date().toISOString(),
        lat: position.lat,
        lng: position.lng,
        distance: Math.round(meters),
      })
      notify(`«${place.shortName}» — чек-ин засчитан`, 'success')
    } catch (error) {
      notify((error as GeoError).message ?? 'Не удалось определить геопозицию', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (!challenges.length) return <NotFound />

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div className="catalog__head">
        <span className="section-head__eyebrow">
          <Icon name="trophy" size={14} /> Челленджи
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 40px)' }}>Соберите город</h1>
        <p className="lead">
          Отмечайтесь на местах — геолокация подтверждает, что вы действительно там были. За
          закрытые челленджи партнёры дают кофе, билеты и скидки.
        </p>
      </div>

      <div className="two-col" style={{ marginBottom: 22 }}>
        <div className="aside-card">
          <span className="aside-card__title">
            Ваш прогресс: {doneCount} из {challenges.length}
          </span>
          <div className="progress" aria-hidden="true">
            <div
              className="progress__bar"
              style={{ width: `${Math.round((doneCount / challenges.length) * 100)}%` }}
            />
          </div>
          <span className="muted" style={{ fontSize: 13 }}>
            Отмечено {ids.size} уникальных мест. Проверка идёт по координатам: радиус{' '}
            {SITE.checkinRadius} м.
          </span>
        </div>
        <div className="aside-card">
          <span className="aside-card__title">Геолокация</span>
          <p className="muted" style={{ fontSize: 13 }}>
            Включите её, чтобы видеть расстояние до точек и отмечаться в один клик. Без доступа
            чек-ин невозможен — так призы не достанутся тем, кто не пришёл.
          </p>
          <button
            type="button"
            className="btn btn--heavenly btn--sm"
            onClick={locate}
            disabled={geoBusy || Boolean(userPos)}
          >
            <Icon name="pin" size={15} />
            {userPos ? 'Геопозиция определена' : geoBusy ? 'Определяем…' : 'Включить геолокацию'}
          </button>
          {demoGeo ? (
            <span className="muted" style={{ fontSize: 11.5 }}>
              Демо-режим: чек-ины засчитываются без реальной геолокации
            </span>
          ) : null}
        </div>
      </div>

      <div className="challenges-grid">
        {challenges.map((challenge) => {
          const checked = challengeProgress(challenge, ids)
          const done = isChallengeDone(challenge, ids)
          const challengePlaces = placesByIds(challenge.placeIds)
          return (
            <article className={`challenge-card ${done ? 'challenge-card--done' : ''}`} key={challenge.id}>
              <div className="challenge-card__head">
                <span className="challenge-card__badge">
                  <Icon name={done ? 'check' : 'trophy'} size={22} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <h2 className="challenge-card__title">{challenge.title}</h2>
                  <p className="challenge-card__desc">{challenge.description}</p>
                </div>
              </div>

              <div className="challenge-card__progress">
                <div className="challenge-card__progress-label">
                  <span>
                    <b>{checked}</b> из {challenge.target} мест
                  </span>
                  <span>{Math.round((checked / challenge.target) * 100)}%</span>
                </div>
                <div className="progress" aria-hidden="true">
                  <div
                    className="progress__bar"
                    style={{ width: `${Math.min(100, (checked / challenge.target) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="challenge-places">
                {challengePlaces.slice(0, 6).map((place) => {
                  const isChecked = ids.has(place.id)
                  const distance =
                    userPos && !isChecked ? distanceMeters(userPos, place) : null
                  return (
                    <div
                      className={`challenge-place ${isChecked ? 'challenge-place--checked' : ''}`}
                      key={place.id}
                    >
                      <span className="challenge-place__check">
                        <Icon name="check" size={13} />
                      </span>
                      <span className="challenge-place__name">{place.shortName}</span>
                      {distance !== null ? (
                        <span className="challenge-place__dist">{formatDistance(distance)}</span>
                      ) : null}
                      {isChecked ? (
                        <span className="challenge-place__dist">засчитано</span>
                      ) : (
                        <button
                          type="button"
                          className="challenge-place__btn"
                          onClick={() => checkin(place.id)}
                          disabled={busyId === place.id}
                        >
                          {busyId === place.id ? 'проверяем…' : 'отметиться'}
                        </button>
                      )}
                    </div>
                  )
                })}
                {challengePlaces.length > 6 ? (
                  <span className="muted" style={{ fontSize: 12, paddingLeft: 4 }}>
                    + ещё {challengePlaces.length - 6} мест в этом челлендже
                  </span>
                ) : null}
              </div>

              <div className="reward">
                <span className="reward__icon">
                  <Icon name="gift" size={18} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="reward__title">{challenge.reward}</div>
                  <div className="reward__sub">
                    {done ? 'Приз разблокирован' : `Партнёр: ${challenge.partner}`}
                  </div>
                </div>
                {done ? <span className="reward__code">{promoCode(challenge.id)}</span> : null}
              </div>
            </article>
          )
        })}
      </div>

      <p className="muted" style={{ fontSize: 12, marginTop: 18 }}>
        Всего {stats.challenges} челленджей. Демо-данные: призы и промокоды — часть прототипа, а не
        реальные обязательства партнёров.
      </p>
    </div>
  )
}
