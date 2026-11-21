export const POSTER_PLACEHOLDER = '/no-poster.svg'

const TYPE_LABELS = {
  movie: 'Фильм',
  series: 'Сериал',
  episode: 'Эпизод',
}

export function posterOf(movie) {
  return movie?.Poster && movie.Poster !== 'N/A' ? movie.Poster : POSTER_PLACEHOLDER
}

const AMAZON_POSTER = /^(https:\/\/m\.media-amazon\.com\/images\/M\/.+?)\._V1_.+\.jpg$/

export function posterSrc(poster, width = 300) {
  if (!poster || poster === 'N/A') return POSTER_PLACEHOLDER

  const match = poster.match(AMAZON_POSTER)
  if (match && width) return `${match[1]}._V1_SX${width}.jpg`

  return poster
}

export function typeOf(movie) {
  if (!movie?.Type) return ''
  return TYPE_LABELS[movie.Type] ?? movie.Type
}

export function isKnown(value) {
  return Boolean(value) && value !== 'N/A'
}
