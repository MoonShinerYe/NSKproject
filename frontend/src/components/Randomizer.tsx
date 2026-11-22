import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Place } from '../types'
import { categoryMeta, pickRandom, plural } from '../lib/filters'
import { Cover } from './Cover'
import { Icon } from '../icons'

const FLIP_MS = 620
const SWAP_MS = 320

export function Randomizer({ places, title = 'Не знаете, с чего начать?' }: { places: Place[]; title?: string }) {
  const [deck, setDeck] = useState<Place[]>(() => pickRandom(places, 3))
  const [flipping, setFlipping] = useState(false)
  const [rolls, setRolls] = useState(0)

  const current = deck[0]

  const roll = () => {
    if (flipping || places.length < 3) return
    setFlipping(true)
    window.setTimeout(() => {
      setDeck(pickRandom(places, 3))
      setRolls((value) => value + 1)
    }, SWAP_MS)
    window.setTimeout(() => setFlipping(false), FLIP_MS)
  }

  if (!current) return null
  const cat = categoryMeta[current.category]

  return (
    <section className="container section" aria-labelledby="random-title">
      <div className="randomizer">
        <div className="randomizer__layout">
          <div className="randomizer__deck" aria-hidden="true">
            {deck.map((place, index) => {
              const meta = categoryMeta[place.category]
              return (
                <div
                  key={`${place.id}-${index}-${rolls}`}
                  className={[
                    'rnd-card',
                    `rnd-card--${index}`,
                    index === 0 && flipping ? 'rnd-card--flipping' : '',
                  ].join(' ')}
                >
                  <Cover cover={place.cover} glyph={meta.emoji} chip={meta.label} />
                  <div className="rnd-card__body">
                    <span className="rnd-card__title">{place.shortName}</span>
                    <span className="rnd-card__meta">
                      {place.priceText} · {place.durationText}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="randomizer__panel">
            <span className="randomizer__kicker">
              <Icon name="shuffle" size={14} /> Рандомайзер
            </span>
            <h2 id="random-title" className="randomizer__title">
              {rolls === 0 ? title : 'А как вам такое?'}
            </h2>
            <p className="randomizer__desc">
              {rolls === 0
                ? 'Три карточки, один клик — и город сам решит, куда вас отправить. Идеально, когда хочется спонтанности.'
                : 'Если не зашло — крутите ещё. В колоде все места каталога: от баров до смотровых.'}
            </p>

            <div aria-live="polite" className="randomizer__result">
              <span className="muted">Выпало:</span>
              <strong key={current.id} className="randomizer__result-name">
                {current.name}
              </strong>
              <span className="meta">
                <span className="meta__item">
                  <Icon name="pin" size={14} /> {current.address}
                </span>
                <span className="meta__item">
                  <Icon name="star" size={14} /> {current.rating.toFixed(1).replace('.', ',')}
                </span>
              </span>
            </div>

            <div className="randomizer__actions">
              <button type="button" className="btn btn--wine" onClick={roll} disabled={flipping}>
                <Icon name="shuffle" size={17} />
                {rolls === 0 ? 'Удиви меня' : 'Ещё вариант'}
              </button>
              <Link to={`/mesta/${current.id}`} className="btn btn--ghost">
                Открыть карточку
                <Icon name="arrow" size={16} />
              </Link>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>
              В колоде {places.length} {plural(places.length, 'место', 'места', 'мест')} ·{' '}
              {cat.label.toLowerCase()} и не только
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
