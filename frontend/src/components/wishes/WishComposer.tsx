import { useEffect, useRef, useState } from 'react'
import { useWishStore } from '../../hooks/useWishStore'

const SESSION_KEY = 'komal-wish-welcome-seen'

export function WishComposer() {
  const { submitWish } = useWishStore()
  const [open, setOpen] = useState(() => sessionStorage.getItem(SESSION_KEY) !== 'true')
  const [wishes, setWishes] = useState(['', '', ''])
  const [shareAnonymously, setShareAnonymously] = useState(true)
  const firstInput = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstInput.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const close = () => {
    sessionStorage.setItem(SESSION_KEY, 'true')
    setOpen(false)
  }

  const updateWish = (index: number, value: string) => {
    setWishes((current) => current.map((wish, wishIndex) => wishIndex === index ? value : wish))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const filledWishes = wishes.map((wish) => wish.trim()).filter(Boolean)
    if (!filledWishes.length) return
    filledWishes.forEach((wish) => submitWish(wish, !shareAnonymously))
    setWishes(['', '', ''])
    close()
  }

  if (!open) return null

  return (
    <div className="wish-dialog-backdrop" role="presentation">
      <form
        className="wish-dialog welcome-wish-dialog"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wish-dialog-title"
        aria-describedby="wish-dialog-description"
      >
        <button className="wish-dialog-close" type="button" onClick={close} aria-label="Close wish window">×</button>
        <span className="wish-dialog-sparkle" aria-hidden="true">✦</span>
        <h2 id="wish-dialog-title">We share the same sky.</h2>
        <p className="wish-dialog-intro" id="wish-dialog-description">
          Somewhere, shooting stars are passing by. Leave up to three wishes here, so when one finds you,
          it knows what to grant.
        </p>

        <div className="wish-fields">
          {wishes.map((wish, index) => (
            <label className="wish-field" key={index}>
              <span>Wish {index + 1}</span>
              <textarea
                ref={index === 0 ? firstInput : undefined}
                maxLength={180}
                rows={2}
                value={wish}
                onChange={(event) => updateWish(index, event.target.value)}
                placeholder={index === 0 ? 'I wish...' : 'Another wish...'}
              />
            </label>
          ))}
        </div>

        <label className="private-wish">
          <input
            type="checkbox"
            checked={shareAnonymously}
            onChange={(event) => setShareAnonymously(event.target.checked)}
          />
          Let others read my wishes anonymously
        </label>

        <div className="wish-dialog-actions">
          <button className="maybe-later" type="button" onClick={close}>Maybe later</button>
          <button className="submit-wish" disabled={!wishes.some((wish) => wish.trim())} type="submit">
            Send wishes to the sky ✦
          </button>
        </div>
      </form>
    </div>
  )
}
