import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useWishStore } from '../../hooks/useWishStore'
import { GrantedMessage } from './GrantedMessage'

type Flight = { id: number; sx: number; sy: number; ex: number; ey: number; angle: number; duration: number }

export function ShootingStarManager() {
  const { pendingWish, grantWish } = useWishStore()
  const [flight, setFlight] = useState<Flight | null>(null)
  const [caught, setCaught] = useState<{ x: number; y: number } | null>(null)
  const [showGranted, setShowGranted] = useState(false)
  const timer = useRef<number | null>(null)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const spawn = useCallback(() => {
    if (!pendingWish || document.hidden || flight) return
    const fromLeft = Math.random() > 0.5
    const sx = fromLeft ? -180 : window.innerWidth + 180
    const ex = fromLeft ? window.innerWidth + 220 : -220
    const sy = Math.round(window.innerHeight * (0.08 + Math.random() * 0.35))
    const ey = Math.round(window.innerHeight * (0.5 + Math.random() * 0.38))
    const angle = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI
    setFlight({ id: Date.now(), sx, sy, ex, ey, angle, duration: 6 + Math.random() * 2 })
  }, [flight, pendingWish])

  useEffect(() => {
    if (!pendingWish || flight || document.hidden) return
    timer.current = window.setTimeout(spawn, 5000 + Math.random() * 40000)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [flight, pendingWish, spawn])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && timer.current) window.clearTimeout(timer.current)
      if (!document.hidden && pendingWish && !flight) spawn()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [flight, pendingWish, spawn])

  const catchStar = (event?: React.PointerEvent<HTMLButtonElement>) => {
    if (!pendingWish) return
    if (!grantWish(pendingWish.id)) return
    setCaught(event ? { x: event.clientX, y: event.clientY } : { x: window.innerWidth / 2, y: window.innerHeight / 2 })
    setFlight(null)
    window.setTimeout(() => setCaught(null), 900)
    setShowGranted(true)
  }

  if (!pendingWish && !showGranted && !caught) return null

  const style = flight ? {
    '--sx': `${flight.sx}px`,
    '--sy': `${flight.sy}px`,
    '--ex': `${flight.ex}px`,
    '--ey': `${flight.ey}px`,
    '--angle': `${flight.angle}deg`,
    '--duration': `${flight.duration}s`,
  } as CSSProperties : undefined

  return (
    <>
      <div className="shooting-star-layer" aria-live="polite">
        {flight && (
          <button
            className={`shooting-star-hit ${reducedMotion ? 'reduced-motion-star' : ''}`}
            style={style}
            onPointerDown={catchStar}
            onAnimationEnd={reducedMotion ? undefined : () => setFlight(null)}
            aria-label="Catch the shooting star and grant your wish"
          >
            <span className="meteor"><i /></span>
          </button>
        )}
        {caught && <span className="catch-spark" style={{ left: caught.x, top: caught.y }} aria-hidden="true" />}
      </div>
      {showGranted && <GrantedMessage onClose={() => setShowGranted(false)} />}
    </>
  )
}
