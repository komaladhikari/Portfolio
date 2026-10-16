import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useWishStore } from '../../hooks/useWishStore'
import { GrantedMessage } from './GrantedMessage'
import {
  appearanceDelay,
  acquireLock,
  createFlight,
  shouldScheduleStar,
  type ShootingStarFlight,
} from './shootingStar'

export function ShootingStarManager() {
  const { clearError, error, pendingWish, grantWish } = useWishStore()
  const [flight, setFlight] = useState<ShootingStarFlight | null>(null)
  const [caught, setCaught] = useState<{ x: number; y: number } | null>(null)
  const [showGranted, setShowGranted] = useState(false)
  const [granting, setGranting] = useState(false)
  const [pageVisible, setPageVisible] = useState(!document.hidden)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const appearanceTimer = useRef<number | null>(null)
  const sparkTimer = useRef<number | null>(null)
  const grantInFlight = useRef(false)
  const active = useRef(true)
  const pendingWishId = pendingWish?.id

  const spawn = useCallback(() => {
    if (!pendingWishId || !pageVisible) return
    setFlight((current) => current ?? createFlight({
      width: window.innerWidth,
      height: window.innerHeight,
    }))
  }, [pageVisible, pendingWishId])

  useEffect(() => {
    if (!shouldScheduleStar(Boolean(pendingWishId), pageVisible, Boolean(flight))) return
    appearanceTimer.current = window.setTimeout(() => {
      appearanceTimer.current = null
      spawn()
    }, appearanceDelay())
    return () => {
      if (appearanceTimer.current !== null) {
        window.clearTimeout(appearanceTimer.current)
        appearanceTimer.current = null
      }
    }
  }, [flight, pageVisible, pendingWishId, spawn])

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handlePreference = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    preference.addEventListener('change', handlePreference)
    return () => preference.removeEventListener('change', handlePreference)
  }, [])

  useEffect(() => {
    if (!pendingWishId) setFlight(null)
  }, [pendingWishId])

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
      if (appearanceTimer.current !== null) window.clearTimeout(appearanceTimer.current)
      if (sparkTimer.current !== null) window.clearTimeout(sparkTimer.current)
    }
  }, [])

  const catchStar = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!pendingWish || !acquireLock(grantInFlight)) return
    setGranting(true)
    try {
      const granted = await grantWish(pendingWish.id)
      if (!active.current || !granted) return
      const keyboardActivation = event.detail === 0
      setCaught(keyboardActivation
        ? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        : { x: event.clientX, y: event.clientY })
      setFlight(null)
      if (sparkTimer.current !== null) window.clearTimeout(sparkTimer.current)
      sparkTimer.current = window.setTimeout(() => {
        sparkTimer.current = null
        setCaught(null)
      }, 900)
      setShowGranted(true)
    } finally {
      grantInFlight.current = false
      if (active.current) setGranting(false)
    }
  }

  if (!pendingWish && !showGranted && !caught && !error) return null

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
            onClick={catchStar}
            onAnimationEnd={reducedMotion ? undefined : () => setFlight(null)}
            aria-label="Catch the shooting star and grant your wish"
            aria-busy={granting}
            disabled={granting}
          >
            <span className="meteor"><i /></span>
          </button>
        )}
        {caught && <span className="catch-spark" style={{ left: caught.x, top: caught.y }} aria-hidden="true" />}
      </div>
      {showGranted && <GrantedMessage onClose={() => setShowGranted(false)} />}
      {error && (
        <aside className="wish-error-message" role="alert">
          <button onClick={clearError} aria-label="Dismiss error">×</button>
          <strong>The star slipped away.</strong>
          <p>{error}</p>
        </aside>
      )}
    </>
  )
}
