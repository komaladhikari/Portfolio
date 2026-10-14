import { useState } from 'react'
import { navigationLinks } from '../data/navigation'
import type { RouteName } from '../hooks/useHashRoute'

export function Navigation({ activeRoute }: { activeRoute: RouteName }) {
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
            href={link === 'Home' ? '#/home' : `#/${link.toLowerCase().replace(' ', '-')}`}
            className={activeRoute === link.toLowerCase().replace(' ', '-') ? 'active' : ''}
            aria-current={activeRoute === link.toLowerCase().replace(' ', '-') ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  )
}
