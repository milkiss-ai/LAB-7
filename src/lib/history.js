import { useEffect, useState } from 'react'

const HISTORY_KEY = 'movie-search-history'
const HISTORY_LIMIT = 5
const CHANGE_EVENT = 'search-history-change'

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    const list = raw ? JSON.parse(raw) : []
    if (!Array.isArray(list)) return []
    return list.filter((item) => typeof item === 'string').slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

function writeHistory(list) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
  } catch {
  }
}

export function rememberQuery(value) {
  const clean = value.trim()
  if (!clean) return

  const next = [
    clean,
    ...readHistory().filter((item) => item.toLowerCase() !== clean.toLowerCase()),
  ].slice(0, HISTORY_LIMIT)

  writeHistory(next)
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useSearchHistory() {
  const [items, setItems] = useState(readHistory)

  useEffect(() => {
    const sync = () => setItems(readHistory())

    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return items
}
