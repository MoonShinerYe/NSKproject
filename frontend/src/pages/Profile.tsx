import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { challenges, places } from '../data'
import { SITE } from '../config'
import { achievements, challengeProgress, checkedInIds, isChallengeDone } from '../lib/game'
import { useStore } from '../lib/store'
import { plural } from '../lib/filters'
import { Icon } from '../icons'
import { PlaceCard } from '../components/PlaceCard'

export function Profile() {
  const {
    favorites,
    checkins,
    reviews,
    name,
    setName,
    demoGeo,
    setDemoGeo,
    reset,
    backend,
    notify,
  } = useStore()

  const [draftName, setDraftName] = useState(name)
  const [editing, setEditing] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const ids = useMemo(() => checkedInIds(checkins), [checkins])
  const favoritePlaces = useMemo(
    () => places.filter((place) => favorites.includes(place.id)),
    [favorites],
  )
  const reviewCount = useMemo(
    () => Object.values(reviews).reduce((sum, list) => sum + list.length, 0),
    [reviews],
  )
  const doneChallenges = useMemo(
    () => challenges.filter((challenge) => isChallengeDone(challenge, ids)),
    [ids],
  )
  const badges = useMemo(
    () => achievements(checkins, favorites, reviewCount, doneChallenges.length),
    [checkins, favorites, reviewCount, doneChallenges.length],
  )

  const displayName = name.trim() || 'Гость'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

  const saveName = () => {
    setName(draftName.trim().slice(0, 40))
    setEditing(false)
    notify('Имя сохранено', 'success')
  }

  const shareSite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Вокруг НСК', url: window.location.origin })
      } else {
        await navigator.clipboard.writeText(window.location.origin)
        notify('Ссылка скопирована', 'success')
      }
    } catch {
      /* отменено */
    }
  }

  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div className="catalog__head">
        <span className="section-head__eyebrow">
          <Icon name="user" size={14} /> Личный кабинет
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 40px)' }}>Ваш прогресс</h1>
      </div>

      <div className="profile-head">
        <span className="profile-avatar" aria-hidden="true">
          {initials || 'Г'}
        </span>
        <div className="profile-head__info">
          {editing ? (
            <form
              className="row"
              onSubmit={(event) => {
                event.preventDefault()
                saveName()
              }}
            >
              <input
                className="input"
                style={{ maxWidth: 260 }}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                placeholder="Ваше имя"
                maxLength={40}
                autoFocus
              />
              <button type="submit" className="btn btn--wine btn--sm">
                Сохранить
              </button>
            </form>
          ) : (
            <span className="profile-head__name">{displayName}</span>
          )}
          <span className="profile-head__sub">
            Данные хранятся только в вашем браузере — без регистрации и паролей.
          </span>
        </div>
        <div className="row">
          {editing ? null : (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setDraftName(name)
                setEditing(true)
              }}
            >
              <Icon name="user" size={15} /> Изменить имя
            </button>
          )}
          <button type="button" className="icon-btn" onClick={shareSite} aria-label="Поделиться сайтом">
            <Icon name="share" size={18} />
          </button>
        </div>
      </div>

      <div className="profile-stats" style={{ marginTop: 14 }}>
        <div className="stat-card">
          <span className="stat-card__value">{checkins.length}</span>
          <span className="stat-card__label">чек-инов</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{favorites.length}</span>
          <span className="stat-card__label">в избранном</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{doneChallenges.length}</span>
          <span className="stat-card__label">челленджей закрыто</span>
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 24 }}>
        <section>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 22 }}>Достижения</h2>
            <span className="muted" style={{ fontSize: 13 }}>
              {badges.filter((badge) => badge.unlocked).length} из {badges.length}
            </span>
          </div>
          <div className="achievements">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`achievement ${badge.unlocked ? 'achievement--on' : ''}`}
                title={badge.description}
              >
                <span className="achievement__icon">
                  <Icon name={badge.icon} size={18} />
                </span>
                <span className="achievement__label">{badge.title}</span>
              </div>
            ))}
          </div>

          <section style={{ marginTop: 26 }} aria-labelledby="profile-challenges">
            <div className="section-head" style={{ marginBottom: 12 }}>
              <h2 id="profile-challenges" style={{ fontSize: 22 }}>
                Челленджи
              </h2>
              <Link to="/chellendzhi" className="section-head__link">
                Все <Icon name="arrow" size={14} />
              </Link>
            </div>
            <div className="stack">
              {challenges.map((challenge) => {
                const checked = challengeProgress(challenge, ids)
                const done = isChallengeDone(challenge, ids)
                return (
                  <div className="aside-card" key={challenge.id} style={{ gap: 8 }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <span className="aside-card__title" style={{ fontSize: 14 }}>
                        {challenge.title}
                      </span>
                      {done ? (
                        <span className="badge badge--success">
                          <Icon name="check" size={12} /> приз
                        </span>
                      ) : (
                        <span className="muted" style={{ fontSize: 12 }}>
                          {checked}/{challenge.target}
                        </span>
                      )}
                    </div>
                    <div className="progress" aria-hidden="true">
                      <div
                        className="progress__bar"
                        style={{
                          width: `${Math.min(100, (checked / challenge.target) * 100)}%`,
                          background: done
                            ? 'linear-gradient(90deg, #2f7d5b, #4aa87a)'
                            : undefined,
                        }}
                      />
                    </div>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {done ? `Промокод: ${challenge.reward}` : `Награда: ${challenge.reward}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>
        </section>

        <aside className="stack">
          <div className="settings">
            <span className="aside-card__title">Настройки</span>

            <label className="settings__row">
              <span>
                <span className="settings__label">Демо-режим геолокации</span>
                <span className="settings__hint">
                  Разрешает чек-ины без реальных координат — для показа на ноутбуке и тестов.
                </span>
              </span>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={demoGeo}
                  onChange={(event) => setDemoGeo(event.target.checked)}
                />
                <span className="switch__track" />
              </span>
            </label>

            <div className="settings__row">
              <span>
                <span className="settings__label">Статус API</span>
                <span className="settings__hint">
                  {backend === 'online'
                    ? 'Бэкенд подключён: чек-ины и отзывы уходят на сервер.'
                    : backend === 'offline'
                      ? 'Бэкенд недоступен — всё сохраняется в браузере.'
                      : 'Проверяем соединение…'}
                </span>
              </span>
              <span className={`badge ${backend === 'online' ? 'badge--success' : 'badge--ink'}`}>
                {backend === 'online' ? 'online' : backend === 'offline' ? 'offline' : '…'}
              </span>
            </div>

            <div className="settings__row">
              <span>
                <span className="settings__label">Радиус чек-ина</span>
                <span className="settings__hint">
                  Подтверждение присутствия — не дальше {SITE.checkinRadius} м от точки.
                </span>
              </span>
              <span className="badge badge--heavenly">{SITE.checkinRadius} м</span>
            </div>

            <div className="settings__row">
              <span>
                <span className="settings__label">Мои отзывы</span>
                <span className="settings__hint">
                  {reviewCount
                    ? `Вы написали ${reviewCount} ${plural(reviewCount, 'отзыв', 'отзыва', 'отзывов')}.`
                    : 'Пока нет отзывов — начните с любого места в каталоге.'}
                </span>
              </span>
            </div>

            <div className="settings__row">
              <span>
                <span className="settings__label">Очистить данные</span>
                <span className="settings__hint">
                  Удалить избранное, чек-ины, отзывы и имя. Отменить нельзя.
                </span>
              </span>
              {confirmReset ? (
                <span className="row" style={{ gap: 6 }}>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmReset(false)}>
                    Нет
                  </button>
                  <button
                    type="button"
                    className="btn btn--wine btn--sm"
                    onClick={() => {
                      reset()
                      setConfirmReset(false)
                    }}
                  >
                    Удалить
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setConfirmReset(true)}
                >
                  Очистить
                </button>
              )}
            </div>
          </div>

          <div className="aside-card">
            <span className="aside-card__title">Избранное</span>
            {favoritePlaces.length ? (
              <div className="fav-mini-list">
                {favoritePlaces.slice(0, 5).map((place) => (
                  <Link key={place.id} to={`/mesta/${place.id}`} className="fav-mini">
                    <span
                      className="fav-mini__cover"
                      style={{ background: `linear-gradient(135deg, ${place.cover.from}, ${place.cover.to})` }}
                      aria-hidden="true"
                    />
                    <span>
                      <span className="fav-mini__name">{place.shortName}</span>
                      <span className="fav-mini__meta">
                        {place.type} · {place.priceText}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted" style={{ fontSize: 13 }}>
                Нажимайте ♥ на карточках, чтобы сохранить места на потом.
              </p>
            )}
          </div>
        </aside>
      </div>

      {favoritePlaces.length ? (
        <section className="section">
          <div className="section-head">
            <h2 style={{ fontSize: 22 }}>Избранные места</h2>
            <Link to="/mesta" className="section-head__link">
              Добавить ещё <Icon name="arrow" size={14} />
            </Link>
          </div>
          <div className="places-grid">
            {favoritePlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      ) : null}

      <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
        Чек-ины хранятся локально и не передаются третьим лицам. В продакшене координаты
        проверяются на сервере и не сохраняются дольше, чем нужно для зачёта.
      </p>
    </div>
  )
}
