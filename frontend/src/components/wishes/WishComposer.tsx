import { useState } from 'react'
import { useWishStore } from '../../hooks/useWishStore'

export function WishComposer() {
  const { wishes, pendingWish, submitWish } = useWishStore()
  const [open, setOpen] = useState(wishes.length === 0)
  const [text, setText] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!text.trim() || pendingWish) return
    submitWish(text.trim(), isPrivate)
    setText('')
    setOpen(false)
  }

  return (
    <>
      {!pendingWish && (
        <button className="make-wish-button" onClick={() => setOpen(true)}>Make a wish ✦</button>
      )}
      {open && (
        <div className="wish-dialog-backdrop" role="presentation">
          <form className="wish-dialog" onSubmit={submit} aria-labelledby="wish-dialog-title">
            <button className="wish-dialog-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
            <span className="wish-dialog-kicker">A quiet little ritual</span>
            <h2 id="wish-dialog-title">What are you wishing for?</h2>
            <textarea
              autoFocus
              maxLength={180}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write your wish softly..."
            />
            <label className="private-wish">
              <input type="checkbox" checked={isPrivate} onChange={(event) => setIsPrivate(event.target.checked)} />
              Keep my wish private
            </label>
            <button className="submit-wish" disabled={!text.trim()} type="submit">Send it to the sky →</button>
          </form>
        </div>
      )}
    </>
  )
}
