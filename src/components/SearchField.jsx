import { useEffect, useRef, useState } from 'react'
import SearchIcon from './SearchIcon.jsx'
import { rememberQuery, useSearchHistory } from '../lib/history.js'

const MAX_SUGGESTIONS = 6

function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder,
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const fieldRef = useRef(null)
  const history = useSearchHistory()

  const query = value.trim().toLowerCase()
  const suggestions = history
    .filter((item) => (query ? item.toLowerCase().includes(query) : true))
    .slice(0, MAX_SUGGESTIONS)

  const isOpen = open && suggestions.length > 0

  useEffect(() => {
    if (!isOpen) return undefined

    const handlePointerDown = (event) => {
      if (!fieldRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  function pick(item) {
    onChange(item)
    rememberQuery(item)
    onSubmit(item)
    setOpen(false)
    setActive(-1)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setOpen(false)
    setActive(-1)
    onSubmit(value.trim())
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setOpen(false)
      setActive(-1)
      return
    }

    if (!isOpen) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current) => (current <= 0 ? suggestions.length - 1 : current - 1))
      return
    }

    if (event.key === 'Enter' && active >= 0 && active < suggestions.length) {
      event.preventDefault()
      pick(suggestions[active])
    }
  }

  return (
    <div
      className="search-field"
      ref={fieldRef}
      onMouseEnter={() => {
        if (!suggestions.length) return
        setOpen(true)
        setActive(-1)
      }}
      onMouseLeave={() => {
        setOpen(false)
        setActive(-1)
      }}
    >
      <form className="search" role="search" onSubmit={handleSubmit}>
        <input
          className="search__input"
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Название фильма"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
        />
      </form>

      {isOpen && (
        <ul className="suggestions" id="search-suggestions" role="listbox" aria-label="Последние запросы">
          <li className="suggestions__label" aria-hidden="true">
            Последние запросы
          </li>
          {suggestions.map((item, index) => (
            <li key={item} role="option" aria-selected={index === active}>
              <button
                className={`suggestions__item${index === active ? ' suggestions__item--active' : ''}`}
                type="button"
                onClick={() => pick(item)}
                onMouseEnter={() => setActive(index)}
              >
                <span className="suggestions__icon" aria-hidden="true">
                  <SearchIcon size={16} />
                </span>
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchField
