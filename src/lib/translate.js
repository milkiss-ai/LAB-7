const CACHE_KEY = 'movie-plot-ru-cache'
const CACHE_LIMIT = 120

let store = null

function load() {
  if (store) return store

  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    store = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    store = {}
  }

  return store
}

function save() {
  const cache = load()
  const keys = Object.keys(cache)

  if (keys.length > CACHE_LIMIT) {
    for (const key of keys.slice(0, keys.length - CACHE_LIMIT)) delete cache[key]
  }

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
  }
}

async function viaGoogle(text) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=' +
    encodeURIComponent(text)

  const res = await fetch(url)
  if (!res.ok) throw new Error('google failed')

  const data = await res.json()
  if (!Array.isArray(data?.[0])) throw new Error('google payload')

  return data[0]
    .map((part) => (Array.isArray(part) && typeof part[0] === 'string' ? part[0] : ''))
    .join('')
    .trim()
}

async function viaMyMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ru`

  const res = await fetch(url)
  if (!res.ok) throw new Error('mymemory failed')

  const data = await res.json()
  const value = data?.responseData?.translatedText

  return typeof value === 'string' ? value.trim() : ''
}

export async function toRussian(text) {
  const source = (text ?? '').trim()

  if (!source) return ''
  if (/[А-Яа-яЁё]/.test(source)) return source

  const cache = load()
  if (cache[source]) return cache[source]

  let result = ''

  try {
    result = await viaGoogle(source)
  } catch {
    result = ''
  }

  if (!result) {
    try {
      result = await viaMyMemory(source)
    } catch {
      result = ''
    }
  }

  if (!result) return source

  cache[source] = result
  save()

  return result
}
