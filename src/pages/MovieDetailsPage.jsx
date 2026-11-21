import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { isKnown, posterSrc, typeOf } from '../lib/format.js'
import { fetchMovieDetails } from '../lib/omdb.js'
import { toRussian } from '../lib/translate.js'

const NOT_FOUND_MESSAGE = 'Фильм с таким идентификатором не найден'
const BAD_ID_MESSAGE = 'Некорректный идентификатор фильма'

function DetailsPoster({ poster, alt }) {
  const [step, setStep] = useState(0)
  const sources = [posterSrc(poster, 500), '/no-poster.svg']
  const src = sources[Math.min(step, sources.length - 1)]

  return (
    <img
      className="details__image"
      src={src}
      alt={alt}
      onError={() => setStep((current) => Math.min(current + 1, sources.length - 1))}
    />
  )
}

function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const preview = location.state?.movie ?? null

  const [result, setResult] = useState(() => ({
    id,
    status: 'loading',
    error: null,
    movie: preview,
  }))
  const [reloadKey, setReloadKey] = useState(0)
  const [translated, setTranslated] = useState({})

  const isCurrent = result.id === id
  const status = isCurrent ? result.status : 'loading'
  const error = isCurrent ? result.error : null
  const movie = isCurrent ? result.movie : null

  useEffect(() => {
    let alive = true

    fetchMovieDetails(id)
      .then((data) => {
        if (!alive) return

        if (data.Error) {
          setResult({
            id,
            status: 'error',
            error: data.Error === 'Movie not found!' ? NOT_FOUND_MESSAGE : BAD_ID_MESSAGE,
            movie: null,
          })
          return
        }

        setResult({ id, status: 'success', error: null, movie: data })
      })
      .catch((err) => {
        if (!alive) return

        setResult({ id, status: 'error', error: err.message, movie: null })
      })

    return () => {
      alive = false
    }
  }, [id, reloadKey])

  const genre = isKnown(movie?.Genre) ? movie.Genre : ''
  const plot = isKnown(movie?.Plot) ? movie.Plot : ''

  useEffect(() => {
    let alive = true

    if (!genre && !plot) return undefined

    Promise.all([toRussian(plot), toRussian(genre)]).then(([ruPlot, ruGenre]) => {
      if (!alive) return
      setTranslated({ plot: ruPlot, genre: ruGenre })
    })

    return () => {
      alive = false
    }
  }, [plot, genre])

  function goBack() {
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }

  function retry() {
    setResult((current) => ({ ...current, status: 'loading', error: null }))
    setReloadKey((key) => key + 1)
  }

  const facts = [
    ['Год', movie?.Year],
    ['Тип', typeOf(movie)],
    ['Жанр', translated.genre || genre],
    ['Режиссёр', movie?.Director],
    ['Актёры', movie?.Actors],
    ['Длительность', movie?.Runtime],
    ['Страна', movie?.Country],
    ['Рейтинг IMDb', movie?.imdbRating],
  ].filter(([, value]) => isKnown(value))

  return (
    <section className="details">
      <Link className="page-title" to="/">
        Популярные фильмы
      </Link>

      <div className="details__toolbar">
        <button className="button" type="button" onClick={goBack}>
          ← Назад
        </button>
      </div>

      {status === 'error' && (
        <>
          <p className="status">{error}</p>
          <div className="status__actions">
            <button className="button" type="button" onClick={retry}>
              Попробовать снова
            </button>
            <Link className="button button--primary" to="/search">
              К поиску фильмов
            </Link>
          </div>
        </>
      )}

      {status !== 'error' && !movie && (
        <p className="status status--loading">
          <span className="spinner spinner--coral" aria-hidden="true" />
          Загружаем сведения о фильме…
        </p>
      )}

      {movie && status !== 'error' && (
        <article className="details__card">
          <div className="details__poster">
            <DetailsPoster
              key={movie.Poster}
              poster={movie.Poster}
              alt={`Постер фильма «${movie.Title}»`}
            />
            {movie.Type && <span className="movie-card__type">{typeOf(movie)}</span>}
          </div>

          <div className="details__info">
            <h1 className="details__title">{movie.Title}</h1>

            {isKnown(movie.imdbRating) && (
              <p className="details__rating">
                IMDb <strong>{movie.imdbRating}</strong>
                {isKnown(movie.imdbVotes) && <span> · {movie.imdbVotes} голосов</span>}
              </p>
            )}

            {status === 'loading' && (
              <p className="details__loading">
                <span className="spinner spinner--small" aria-hidden="true" />
                Уточняем подробности…
              </p>
            )}

            {facts.length > 0 && (
              <dl className="details__facts">
                {facts.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="details__block">
              <h2 className="details__heading">Описание</h2>
              <p className="details__plot">
                {translated.plot ||
                  plot ||
                  (status === 'loading' ? 'Загружается…' : 'Описание недоступно')}
              </p>
            </div>

            {isKnown(movie.Awards) && (
              <div className="details__block">
                <h2 className="details__heading">Награды</h2>
                <p className="details__plot">{movie.Awards}</p>
              </div>
            )}

            {isKnown(movie.BoxOffice) && (
              <div className="details__block">
                <h2 className="details__heading">Сборы</h2>
                <p className="details__plot">{movie.BoxOffice}</p>
              </div>
            )}

            <div className="details__block">
              <a
                className="button button--primary"
                href={`https://www.imdb.com/title/${id}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть на IMDb
              </a>
            </div>
          </div>
        </article>
      )}
    </section>
  )
}

export default MovieDetailsPage
