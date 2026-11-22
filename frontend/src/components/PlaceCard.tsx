import { Link } from 'react-router-dom'
import type { Place } from '../types'
import { categoryMeta } from '../lib/filters'
import { Cover } from './Cover'
import { FavoriteButton, Rating } from './Rating'

export function PlaceCard({ place }: { place: Place }) {
  const cat = categoryMeta[place.category]
  return (
    <Link to={`/mesta/${place.id}`} className="place-card" aria-label={place.name}>
      <Cover
        cover={place.cover}
        image={place.image}
        className="place-card__cover"
        glyph={cat.emoji}
        chip={
          <>
            <span aria-hidden="true">{cat.emoji}</span>
            {cat.label}
          </>
        }
        action={<FavoriteButton placeId={place.id} size={17} />}
      />
      <div className="place-card__body">
        <h3 className="place-card__title">{place.shortName || place.name}</h3>
        <p className="place-card__desc">{place.short}</p>
        <div className="place-card__tags">
          {place.themes.slice(0, 2).map((theme) => (
            <span key={theme} className="place-card__tag">
              {theme}
            </span>
          ))}
          <span className="place-card__tag">{place.durationText}</span>
        </div>
        <div className="place-card__foot">
          <Rating value={place.rating} count={place.reviewsCount} compact />
          <span
            className={`place-card__price ${place.budget === 'free' ? 'place-card__price--free' : ''}`}
          >
            {place.priceText}
          </span>
        </div>
      </div>
    </Link>
  )
}
