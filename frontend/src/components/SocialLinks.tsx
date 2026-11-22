import { SITE } from '../config'
import { Icon } from '../icons'

export function SocialLinks() {
  return (
    <section className="container section" aria-labelledby="socials-title">
      <div className="socials">
        <div>
          <span className="section-head__eyebrow">
            <Icon name="sparkles" size={14} /> Мы в соцсетях
          </span>
          <h2 id="socials-title" style={{ fontSize: 'clamp(20px, 2.6vw, 26px)' }}>
            Новые места — каждую неделю
          </h2>
          <p className="lead" style={{ marginTop: 8 }}>
            Показываем свежие находки, закрытые вечеринки и розыгрыши билетов среди подписчиков.
          </p>
        </div>
        <div className="socials__list">
          {SITE.socials.map((social) => (
            <a
              key={social.id}
              className="social-btn"
              href={social.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span
                className={`social-btn__icon ${
                  social.id === 'tg'
                    ? 'social-btn__icon--tg'
                    : social.id === 'yt'
                      ? 'social-btn__icon--yt'
                      : ''
                }`}
              >
                <Icon name={social.icon} size={17} />
              </span>
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
