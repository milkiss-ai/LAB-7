import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { POSTER_PLACEHOLDER, posterOf, posterSrc, typeOf } from '../lib/format.js'
import { fetchMoviePlot } from '../lib/omdb.js'
import { toRussian } from '../lib/translate.js'

function MovieCard({ movie, plotText, eager = false }) {
  const [poster, setPoster] = useState(() => posterSrc(posterOf(movie)))
  const [retry, setRetry] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [plot, setPlot] = useState('')
  const [plotStatus, setPlotStatus] = useState('loading')

  useEffect(() => {
    let alive = true

    const source = plotText ? Promise.resolve(plotText) : fetchMoviePlot(movie.imdbID)

    source
      .then((text) => (text ? toRussian(text) : ''))
      .then((text) => {
        if (!alive) return
        setPlot(text)
        setPlotStatus('done')
      })
      .catch(() => {
        if (!alive) return
        setPlotStatus('done')
      })

    return () => {
      alive = false
    }
  }, [movie.imdbID, plotText])

  const isPlaceholder = poster === POSTER_PLACEHOLDER

  function handlePosterError() {
    if (retry === 0 && !isPlaceholder) {
      setRetry(1)
      return
    }

    setPoster(POSTER_PLACEHOLDER)
    setLoaded(true)
  }

  const posterUrl = retry === 0 ? poster : `${poster}${poster.includes('?') ? '&' : '?'}retry=1`

  const card = (
    <>
      <div className={`movie-card__poster${loaded ? ' movie-card__poster--loaded' : ''}`}>
        <img
          src={posterUrl}
          alt={`Постер фильма «${movie.Title}»`}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={handlePosterError}
        />
        {movie.Type && <span className="movie-card__type">{typeOf(movie)}</span>}
      </div>
      <div className="movie-card__body">
        <h3 className="movie-card__title">{movie.Title}</h3>
        <dl className="movie-card__meta">
          <div>
            <dt>Год</dt>
            <dd>{movie.Year}</dd>
          </div>
        </dl>

        {plotStatus === 'loading' && (
          <p className="movie-card__plot movie-card__plot--loading">
            <span className="spinner spinner--small" aria-hidden="true" />
            Загрузка описания…
          </p>
        )}

        {plotStatus === 'done' && plot && (
          <p className="movie-card__plot" title={plot}>
            {plot}
          </p>
        )}

        {plotStatus === 'done' && !plot && (
          <p className="movie-card__plot movie-card__plot--empty">Описание недоступно</p>
        )}
      </div>
    </>
  )

  if (!movie.imdbID) return <article className="movie-card">{card}</article>

  return (
    <Link
      className="movie-card"
      to={`/movie/${movie.imdbID}`}
      state={{ movie }}
      aria-label={`Подробнее о фильме «${movie.Title}»`}
    >
      {card}
    </Link>
  )
}

export default MovieCard
