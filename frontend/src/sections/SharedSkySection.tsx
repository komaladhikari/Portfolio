import { useEffect, useMemo, useState } from 'react'
import { SectionLabel } from '../components/SectionLabel'
import { useWishStore } from '../hooks/useWishStore'
import type { SkyWish } from '../types/wish'
import { layoutSkyStars } from './skyLayout'

const decorativeStars = Array.from({ length: 52 }, (_, index) => ({
  x: (index * 47 + 9) % 96,
  y: (index * 71 + 7) % 88,
  size: index % 9 === 0 ? 2 : 1,
}))

export function SkyWishText({ text }: { text: string }) {
  return <p>{text}</p>
}

export function isWishOwned(wishId: string, ownedWishIds: string[]) {
  return ownedWishIds.includes(wishId)
}

export function SharedSkySection() {
  const {
    grantedWishes,
    wishes,
    deleteWish,
    hasMoreSky,
    isLoadingMoreSky,
    isLoadingSky,
    loadMoreSky,
    refreshSky,
    skyError,
  } = useWishStore()
  const [selected, setSelected] = useState<SkyWish | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const displayedWishes = useMemo(() => layoutSkyStars(grantedWishes), [grantedWishes])
  const selectedIsOwned = selected
    ? isWishOwned(selected.id, wishes.map((wish) => wish.id))
    : false

  async function removeSelectedWish() {
    if (!selected || isDeleting) return
    const confirmed = window.confirm('Delete this wish permanently? This cannot be undone.')
    if (!confirmed) return

    setIsDeleting(true)
    const deleted = await deleteWish(selected.id)
    setIsDeleting(false)
    if (deleted) setSelected(null)
  }

  useEffect(() => {
    if (!selected) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])

  return (
    <section className="shared-sky-section" id="shared-sky" data-reveal aria-labelledby="sky-title">
      <header className="sky-heading">
        <SectionLabel>Shared Sky</SectionLabel>
        <h2 id="sky-title">Every Wish Leaves a Light</h2>
        <p>Catch your shooting star and your wish will find a permanent place here.</p>
      </header>

      <div className="shared-sky-field" aria-busy={isLoadingSky || isLoadingMoreSky}>
        {decorativeStars.map((star, index) => (
          <i aria-hidden="true" className="decorative-star" key={index} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }} />
        ))}
        {displayedWishes.map((wish) => (
          <button
            className="granted-star"
            key={wish.id}
            style={{ left: `${wish.x}%`, top: `${wish.y}%` }}
            onClick={() => setSelected(wish)}
            aria-label="Read this granted wish"
          />
        ))}
        {isLoadingSky && <p className="sky-loading" role="status">Gathering starlight...</p>}
        {!isLoadingSky && !skyError && !grantedWishes.length && (
          <p className="sky-empty">The sky is waiting for its first granted wish.</p>
        )}
        {selected && (
          <div className="sky-wish-note" role="dialog" aria-modal="false" aria-labelledby="selected-wish-title">
            <button className="sky-wish-note-close" onClick={() => setSelected(null)} aria-label="Close">×</button>
            <span id="selected-wish-title">Someone wished</span>
            <SkyWishText text={selected.text} />
            {selectedIsOwned && (
              <button
                className="sky-wish-delete"
                type="button"
                onClick={() => void removeSelectedWish()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete my wish'}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="sky-controls">
        {skyError && (
          <div className="sky-error" role="alert">
            <span>{skyError}</span>
            <button type="button" onClick={() => void refreshSky()}>Try again</button>
          </div>
        )}
        {!skyError && hasMoreSky && (
          <button
            className="sky-load-more"
            type="button"
            onClick={() => void loadMoreSky()}
            disabled={isLoadingMoreSky}
          >
            {isLoadingMoreSky ? 'Gathering more...' : 'Reveal more stars'}
          </button>
        )}
      </div>

      <a className="beneath-sky-link" href="#/beneath-the-sky">
        Beneath the Sky <span aria-hidden="true">→</span>
      </a>
    </section>
  )
}
