import { Link } from 'react-router-dom'
import { collections, stats } from '../data'
import { Icon } from '../icons'
import { CollectionCard } from '../components/CollectionCard'

export function Collections() {
  return (
    <div className="container section" style={{ paddingTop: 32 }}>
      <div className="catalog__head">
        <span className="section-head__eyebrow">
          <Icon name="compass" size={14} /> Подборки
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 4.6vw, 40px)' }}>Готовые сценарии</h1>
        <p className="lead">
          {stats.collections} подборок под ситуацию: два часа между встречами, свидание, поездка с
          детьми или желание увидеть город, который не показывают в путеводителях.
        </p>
      </div>

      <div className="collections-grid">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>

      <div className="cta-band" style={{ marginTop: 28 }}>
        <div>
          <h2 className="cta-band__title">Не нашли сценарий?</h2>
          <p className="cta-band__text">
            Соберите свой: каталог фильтруется по бюджету, компании и настроению, а чек-ины
            складываются в личный прогресс.
          </p>
        </div>
        <Link to="/mesta" className="btn btn--milk">
          <Icon name="pin" size={16} /> В каталог
        </Link>
      </div>
    </div>
  )
}
