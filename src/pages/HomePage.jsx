import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard.jsx'
import SearchField from '../components/SearchField.jsx'
import { fetchMovieById } from '../lib/omdb.js'
import { rememberQuery } from '../lib/history.js'

const POPULAR_IDS = [
  'tt0111161',
  'tt0068646',
  'tt0468569',
  'tt0110912',
  'tt0109830',
  'tt1375666',
  'tt0133093',
  'tt0137523',
  'tt0120737',
  'tt0816692',
  'tt0120815',
  'tt0172495',
]

const LOAD_ERROR = 'Не удалось загрузить подборку фильмов'

function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true

    Promise.all(POPULAR_IDS.map((id) => fetchMovieById(id).catch(() => null)))
      .then((list) => {
        if (!alive) return

        const found = list.filter((item) => item && !item.Error)

        setMovies(found)
        setStatus(found.length ? 'success' : 'error')
        setError(found.length ? null : LOAD_ERROR)
      })
      .catch(() => {
        if (!alive) return

        setMovies([])
        setStatus('error')
        setError(LOAD_ERROR)
      })

    return () => {
      alive = false
    }
  }, [reloadKey])

  function handleSearch(value) {
    const clean = value.trim()
    if (!clean) return

    rememberQuery(clean)
    navigate(`/search?q=${encodeURIComponent(clean)}`)
  }

  function retry() {
    setStatus('loading')
    setError(null)
    setReloadKey((key) => key + 1)
  }

  return (
    <>
      <h1 className="page-title">Популярные фильмы</h1>

      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        placeholder="Не нашли нужный фильм? Напишите название фильма."
      />

      <section className="results">
        {status === 'loading' && (
          <p className="status status--loading">
            <span className="spinner spinner--coral" aria-hidden="true" />
            Загружаем подборку…
          </p>
        )}

        {status === 'error' && (
          <>
            <p className="status">{error}</p>
            <div className="status__actions">
              <button className="button" type="button" onClick={retry}>
                Попробовать снова
              </button>
            </div>
          </>
        )}

        {status === 'success' && movies.length > 0 && (
          <div className="movie-list">
            {movies.map((movie, index) => (
              <MovieCard
                key={movie.imdbID}
                movie={movie}
                eager={index < 4}
                plotText={movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : ''}
              />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default HomePage
