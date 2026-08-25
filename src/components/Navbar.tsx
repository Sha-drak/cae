import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/navbar.css'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#about' },
  { label: 'Ministries', href: '#ministries' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="navbar" role="banner">
      <a href="#" className="navbar__logo">
        Christian Awareness Embassy
      </a>

      <button
        type="button"
        className={`navbar__toggle ${isMenuOpen ? 'is-open' : ''}`}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span className="navbar__toggle__bar" />
        <span className="navbar__toggle__bar" />
        <span className="navbar__toggle__bar" />
      </button>

      <nav
        className={`navbar__menu ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="Primary navigation"
      >
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        <Link to="/gallery" onClick={() => setIsMenuOpen(false)}>
          Albums
        </Link>
      </nav>
    </header>
  )
}
