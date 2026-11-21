import { NavLink, useLocation } from 'react-router-dom'
import CameraIcon from './CameraIcon.jsx'
import SearchIcon from './SearchIcon.jsx'

function Navbar() {
  const { pathname } = useLocation()
  const onSearch = pathname.startsWith('/search')

  return (
    <nav className="navbar" aria-label="Разделы сайта">
      <span className={`navbar__thumb${onSearch ? ' navbar__thumb--right' : ''}`} aria-hidden="true" />

      <NavLink
        className="navbar__link"
        to="/"
        end
        aria-label="Популярные фильмы"
        title="Популярные фильмы"
      >
        <CameraIcon />
      </NavLink>

      <NavLink
        className="navbar__link"
        to="/search"
        aria-label="Поиск фильмов"
        title="Поиск фильмов"
      >
        <SearchIcon />
      </NavLink>
    </nav>
  )
}

export default Navbar
