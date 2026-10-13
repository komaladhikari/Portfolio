import { useState } from 'react'
import { navigationLinks } from '../data/navigation'

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar" aria-label="Main navigation">
      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <i />
        <i />
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {navigationLinks.map((link) => (
          <a
            key={link}
            href={link === 'Home' ? '#home' : `#${link.toLowerCase().replace(' ', '-')}`}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  )
}
