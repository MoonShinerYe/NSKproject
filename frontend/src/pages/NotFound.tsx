import { Link } from 'react-router-dom'
import { Icon } from '../icons'

export function NotFound() {
  return (
    <div className="container section" style={{ paddingTop: 60 }}>
      <div className="empty">
        <span className="empty__icon">
          <Icon name="compass" size={26} />
        </span>
        <h1 className="empty__title">Такой страницы нет</h1>
        <p className="muted" style={{ maxWidth: '44ch' }}>
          Возможно, место переименовали или ссылка устарела. Загляните в каталог — там всё на
          месте.
        </p>
        <Link to="/mesta" className="btn btn--wine">
          <Icon name="pin" size={16} /> К местам
        </Link>
      </div>
    </div>
  )
}
