import { useEffect, useRef, useState } from 'react'
import { useWishStore } from '../../hooks/useWishStore'

export function WishComposer({ isHome }: { isHome: boolean }) {
  const { submitWish } = useWishStore()
  const [open, setOpen] = useState(isHome)
  const [wishes, setWishes] = useState([''])
  const [shareAnonymously, setShareAnonymously] = useState(true)
  const firstInput = useRef<HTMLTextAreaElement>(null)
  const dialog = useRef<HTMLFormElement>(null)
  const wasHome = useRef(isHome)

  const close = () => {
    setOpen(false)
    setWishes([''])
  }

  useEffect(() => {
    if (isHome && !wasHome.current) setOpen(true)
    if (!isHome) setOpen(false)
    wasHome.current = isHome
  }, [isHome])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previouslyFocused = document.activeElement
    document.body.style.overflow = 'hidden'
    firstInput.current?.focus()

    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key !== 'Tab' || !dialog.current) return

      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled])',
      ))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyboard)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  const addWish = () => {
    if (wishes.length >= 3) return
    setWishes((current) => [...current, ''])
    requestAnimationFrame(() => {
      const fields = dialog.current?.querySelectorAll<HTMLTextAreaElement>('textarea')
      fields?.[fields.length - 1]?.focus()
    })
  }

  const updateWish = (index: number, value: string) => {
    setWishes((current) => current.map((wish, wishIndex) => wishIndex === index ? value : wish))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const filledWishes = wishes.map((wish) => wish.trim()).filter(Boolean)
    if (!filledWishes.length) return
    filledWishes.forEach((wish) => submitWish(wish, !shareAnonymously))
    close()
  }

  if (!open) return null

  return (
    <div className="wish-dialog-backdrop" role="presentation">
      <form
        ref={dialog}
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
          Somewhere, a shooting star is passing by. Leave a wish for it to carry.
        </p>

        <div className="wish-fields">
          {wishes.map((wish, index) => (
            <label className="wish-field" key={index}>
              <textarea
                ref={index === 0 ? firstInput : undefined}
                maxLength={180}
                rows={2}
                value={wish}
                onChange={(event) => updateWish(index, event.target.value)}
                placeholder="I wish..."
                aria-label={`Wish ${index + 1}`}
              />
            </label>
          ))}
        </div>

        {wishes.length < 3 && (
          <button className="add-wish" type="button" onClick={addWish}>+ Add another wish</button>
        )}

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
            Send to the sky ✦
          </button>
        </div>
      </form>
    </div>
  )
}
