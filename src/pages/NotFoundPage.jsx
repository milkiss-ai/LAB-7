import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Такой страницы нет</h1>
      <p className="not-found__text">
        Адрес введён с опечаткой или страница переехала. Проверьте ссылку или вернитесь на главную.
      </p>
      <div className="not-found__actions">
        <Link className="button button--primary" to="/">
          На главную
        </Link>
        <Link className="button" to="/search">
          К поиску фильмов
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
