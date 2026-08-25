import { Link } from 'react-router-dom'

export default function SiteHeader({ active }: { active: 'gallery' | 'home' }) {
  return (
    <header className="site-header" role="banner">
      <Link to="/" className="site-header__logo">
        Christian Awareness Embassy
      </Link>
      <nav className="site-header__nav" aria-label="Site navigation">
        <Link to="/" className={active === 'home' ? 'is-active' : ''}>
          Home
        </Link>
        <Link to="/gallery" className={active === 'gallery' ? 'is-active' : ''}>
          Albums
        </Link>
      </nav>
    </header>
  )
}
