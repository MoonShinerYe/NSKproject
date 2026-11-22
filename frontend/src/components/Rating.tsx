import { Icon } from '../icons'
import { useStore } from '../lib/store'

export function Rating({
  value,
  count,
  compact = false,
}: {
  value: number
  count?: number
  compact?: boolean
}) {
  return (
    <span className="rating" title={`Рейтинг ${value} из 5`}>
      <Icon name="star" size={compact ? 13 : 15} />
      {value.toFixed(1).replace('.', ',')}
      {typeof count === 'number' ? (
        <span className="rating__count">({count.toLocaleString('ru-RU')})</span>
      ) : null}
    </span>
  )
}

export function FavoriteButton({
  placeId,
  className = 'icon-btn',
  size = 18,
}: {
  placeId: string
  className?: string
  size?: number
}) {
  const { isFavorite, toggleFavorite, notify } = useStore()
  const active = isFavorite(placeId)

  return (
    <button
      type="button"
      className={`${className} ${active ? 'icon-btn--active' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const nowFavorite = toggleFavorite(placeId)
        notify(nowFavorite ? 'Добавлено в избранное' : 'Убрано из избранного', 'success')
      }}
    >
      <Icon
        name="heart"
        size={size}
        style={active ? { fill: 'currentColor' } : undefined}
      />
    </button>
  )
}
