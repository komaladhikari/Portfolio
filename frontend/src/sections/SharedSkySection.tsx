import { useState } from 'react'
import { SectionLabel } from '../components/SectionLabel'
import { useWishStore } from '../hooks/useWishStore'
import type { Wish } from '../types/wish'

const decorativeStars = Array.from({ length: 52 }, (_, index) => ({
  x: (index * 47 + 9) % 96,
  y: (index * 71 + 7) % 88,
  size: index % 9 === 0 ? 2 : 1,
}))

export function SharedSkySection() {
  const { grantedWishes } = useWishStore()
  const [selected, setSelected] = useState<Wish | null>(null)

  return (
    <section className="shared-sky-section" id="shared-sky" data-reveal aria-labelledby="sky-title">
      <header className="sky-heading">
        <SectionLabel>Shared Sky</SectionLabel>
        <h2 id="sky-title">Every Wish Leaves a Light</h2>
        <p>Catch your shooting star and your wish will find a permanent place here.</p>
      </header>

      <div className="shared-sky-field">
        {decorativeStars.map((star, index) => (
          <i className="decorative-star" key={index} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }} />
        ))}
        {grantedWishes.map((wish) => (
          <button
            className="granted-star"
            key={wish.id}
            style={{ left: `${wish.x}%`, top: `${wish.y}%` }}
            onClick={() => setSelected(wish)}
            aria-label="Read this granted wish"
          />
        ))}
        {selected && (
          <div className="sky-wish-note">
            <button onClick={() => setSelected(null)} aria-label="Close">×</button>
            <span>Someone wished</span>
            <p>{selected.isPrivate ? 'Someone wished for something beautiful here.' : `“${selected.text}”`}</p>
          </div>
        )}
      </div>
    </section>
  )
}
