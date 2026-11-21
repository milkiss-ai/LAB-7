import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MovieCard from '../components/MovieCard.jsx'
import SearchField from '../components/SearchField.jsx'
import { searchMovies } from '../lib/omdb.js'
import { rememberQuery } from '../lib/history.js'

const NOT_FOUND_MESSAGE = 'Ничего не найдено'
const API_ERRORS = {
  'Too many results.': 'Слишком много совпадений — уточните название',
}

const PAGE_SIZE = 10

const EMPTY_RESULT = {
  query: '',
  page: 1,
  movies: [],
  total: 0,
  status: 'idle',
  error: null,
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1)

  const [input, setInput] = useState(query)
  const [syncedQuery, setSyncedQuery] = useState(query)
  const [formError, setFormError] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState(EMPTY_RESULT)
  const requestId = useRef(0)

  if (syncedQuery !== query) {
    setSyncedQuery(query)
    setInput(query)
  }

  const isCurrent = result.query === query && result.page === page
  const movies = isCurrent ? result.movies : []
  const total = isCurrent ? result.total : 0
  const error = isCurrent ? result.error : null
  const status = !query ? 'idle' : isCurrent ? result.status : 'loading'
  const isLoading = status === 'loading'

  useEffect(() => {
    if (!query) return undefined

    let alive = true
    const request = requestId.current + 1
    requestId.current = request

    searchMovies(query, page)
      .then((data) => {
        if (!alive || request !== requestId.current) return

        if (data.Error) {
          setResult({
            query,
            page,
            movies: [],
            total: 0,
            status: 'error',
            error:
              data.Error === 'Movie not found!'
                ? NOT_FOUND_MESSAGE
                : (API_ERRORS[data.Error] ?? data.Error),
          })
          return
        }

        setResult({
          query,
          page,
          movies: Array.isArray(data.Search) ? data.Search : [],
          total: Number(data.totalResults) || 0,
          status: 'success',
          error: null,
        })
        rememberQuery(query)
      })
      .catch((err) => {
        if (!alive || request !== requestId.current) return

        setResult({ query, page, movies: [], total: 0, status: 'error', error: err.message })
      })

    return () => {
      alive = false
    }
  }, [query, page, reloadKey])

  function handleInputChange(value) {
    setInput(value)
    setFormError('')

  }

  function handleSubmit(value) {
    const clean = value.trim()

    if (!clean) {
      setFormError('Введите название фильма')
      return
    }

    rememberQuery(clean)

    if (clean === query && page === 1) {
      setReloadKey((key) => key + 1)
      return
    }

    setSearchParams({ q: clean }, { replace: true })
  }


  function goToPage(nextPage) {
    if (!query) return
    setSearchParams({ q: query, page: String(nextPage) })
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const from = Number.parseInt(yearFrom, 10)
  const to = Number.parseInt(yearTo, 10)

  const visibleMovies = movies.filter((movie) => {
    const year = Number.parseInt(movie.Year, 10)
    if (Number.isNaN(year)) return true
    if (!Number.isNaN(from) && year < from) return false
    if (!Number.isNaN(to) && year > to) return false
    return true
  })

  const isFiltered = visibleMovies.length !== movies.length

  return (
    <>
      <Link className="page-title" to="/">
        Популярные фильмы
      </Link>

      <SearchField
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        placeholder="Не нашли нужный фильм? Напишите название фильма."
        autoFocus
      />

      {formError && <p className="form-error">{formError}</p>}

      {status !== 'idle' && (
        <div className="filters">
          <label className="filters__field">
            <span>Год от</span>
            <input
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value)}
            />
          </label>

          <label className="filters__field">
            <span>Год до</span>
            <input
              type="number"
              inputMode="numeric"
              min="1900"
              max="2100"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value)}
            />
          </label>

          {isFiltered && (
            <span className="filters__count">
              По фильтру: {visibleMovies.length} из {movies.length}
            </span>
          )}
        </div>
      )}

      <section className="results">
        {status === 'loading' && (
          <p className="status status--loading">
            <span className="spinner spinner--coral" aria-hidden="true" />
            Ищем фильмы…
          </p>
        )}

        {status === 'error' && <p className="status">{error}</p>}

        {status === 'success' && movies.length === 0 && (
          <p className="status">{NOT_FOUND_MESSAGE}</p>
        )}

        {status === 'success' && movies.length > 0 && (
          <>
            {visibleMovies.length > 0 ? (
              <div className="movie-list">
                {visibleMovies.map((movie, index) => (
                  <MovieCard key={movie.imdbID} movie={movie} eager={index < 4} />
                ))}
              </div>
            ) : (
              <p className="status">В выбранном диапазоне годов ничего нет</p>
            )}

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Постраничная навигация">
                <button
                  className="pagination__button"
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  Предыдущая
                </button>

                <span className="pagination__info">
                  Страница {page} из {totalPages}
                </span>

                <button
                  className="pagination__button"
                  type="button"
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  Следующая
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  )
}

export default SearchPage
