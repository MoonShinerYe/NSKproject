import { Link } from 'react-router-dom'
import type { Collection } from '../types'
import { plural } from '../lib/filters'
import { CoverArt } from './Cover'

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link to={`/podborki/${collection.id}`} className="collection-card">
      <CoverArt cover={collection.cover} />
      <div className="collection-card__body">
        <span className="collection-card__sub">{collection.subtitle}</span>
        <span className="collection-card__title">{collection.title}</span>
        <span className="collection-card__meta">
          <span>
            {collection.placesCount}{' '}
            {plural(collection.placesCount, 'место', 'места', 'мест')}
          </span>
          <span>·</span>
          <span>{collection.duration}</span>
        </span>
      </div>
    </Link>
  )
}
