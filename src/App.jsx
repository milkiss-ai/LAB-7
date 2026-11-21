import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Background from './components/Background.jsx'
import Navbar from './components/Navbar.jsx'
import HomePage from './pages/HomePage.jsx'

const SearchPage = lazy(() => import('./pages/SearchPage.jsx'))
const MovieDetailsPage = lazy(() => import('./pages/MovieDetailsPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'))

function PageLoader() {
  return (
    <div className="page-loader" role="status">
      <span className="spinner spinner--coral" aria-hidden="true" />
      <span>Загрузка страницы…</span>
    </div>
  )
}

function App() {
  const { pathname } = useLocation()
  const showNavbar = !pathname.startsWith('/movie')

  useEffect(() => {
    window.scrollTo(0,0)
  }, [pathname])

  return (
    <div className="page">
      <Background />
      {showNavbar && <Navbar />}

      <main className={`content${showNavbar ? '' : ' content--compact'}`}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
