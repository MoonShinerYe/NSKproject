import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Icon } from '../icons'
import { useStore } from '../lib/store'
import { api } from '../lib/api'
import { SITE } from '../config'

const NAV = [
  { to: '/mesta', label: 'Места' },
  { to: '/podborki', label: 'Подборки' },
  { to: '/marshruty', label: 'Маршруты' },
  { to: '/chellendzhi', label: 'Челленджи' },
  { to: '/profil', label: 'Профиль' },
]

function Header() {
  const [scrolled, setScrolled] = useState(false)
  const { favorites } = useStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <Link to="/" className="logo" aria-label="Вокруг НСК — на главную">
          <span className="logo__mark">НСК</span>
          <span className="logo__text">
            <span className="logo__title">Вокруг НСК</span>
            <span className="logo__sub">{SITE.tagline}</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Основная навигация">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <Link
            to="/profil"
            className="icon-btn"
            aria-label={`Избранное: ${favorites.length}`}
            title="Избранное"
          >
            <Icon name="heart" size={19} />
          </Link>
          <Link to="/profil" className="btn btn--wine btn--sm" aria-label="Личный кабинет">
            <Icon name="user" size={16} />
            <span className="header__profile-text">Профиль</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

function TabBar() {
  return (
    <nav className="tabbar" aria-label="Навигация по разделам">
      {NAV.map((item) => {
        const icon =
          item.to === '/mesta'
            ? 'pin'
            : item.to === '/podborki'
              ? 'compass'
              : item.to === '/marshruty'
                ? 'route'
                : item.to === '/chellendzhi'
                  ? 'trophy'
                  : 'user'
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `tabbar__item ${isActive ? 'tabbar__item--active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <span className="tabbar__icon">
                  <Icon name={icon} size={21} strokeWidth={isActive ? 2 : 1.7} />
                  {isActive ? <span className="tabbar__dot" /> : null}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

function Footer() {
  const { backend } = useStore()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <p className="footer__title">Вокруг НСК</p>
            <p className="footer__text">
              Мобильный гид по необычному Новосибирску для гостей города. Открывается по QR-коду в
              отелях-партнёрах — без установки приложения и обязательной регистрации.
            </p>
          </div>
          <div>
            <p className="footer__title">Разделы</p>
            <div className="footer__links">
              {NAV.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="footer__title">Партнёры</p>
            <div className="footer__links">
              {SITE.partners.map((partner) => (
                <span key={partner}>{partner}</span>
              ))}
            </div>
            <p className="footer__text" style={{ marginTop: 10 }}>
              Хотите разместить место или приз? Напишите нам:{' '}
              <a href="mailto:hello@vokrug-nsk.ru">hello@vokrug-nsk.ru</a>
            </p>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Вокруг НСК · демо-проект</span>
          <span className="meta__item">
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                display: 'inline-block',
                background:
                  backend === 'online'
                    ? 'var(--success)'
                    : backend === 'offline'
                      ? 'var(--ink-4)'
                      : 'var(--gold)',
              }}
            />
            {backend === 'online'
              ? 'API подключён'
              : backend === 'offline'
                ? 'офлайн-режим'
                : 'проверяем API…'}
          </span>
        </div>
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export function Layout() {
  const { toast, setBackend } = useStore()

  useEffect(() => {
    let alive = true
    api
      .health()
      .then(() => alive && setBackend('online'))
      .catch(() => alive && setBackend('offline'))
    return () => {
      alive = false
    }
  }, [setBackend])

  return (
    <div className="app">
      <Header />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
      <TabBar />
      <ScrollToTop />
      <div aria-live="polite" role="status">
        {toast ? (
          <div key={toast.id} className={`toast ${toast.tone !== 'default' ? `toast--${toast.tone}` : ''}`}>
            {toast.tone === 'success' ? <Icon name="check" size={17} /> : null}
            {toast.tone === 'error' ? <Icon name="close" size={16} /> : null}
            {toast.message}
          </div>
        ) : null}
      </div>
    </div>
  )
}
