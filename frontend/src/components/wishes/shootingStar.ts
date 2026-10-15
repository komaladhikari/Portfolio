export const MIN_APPEARANCE_DELAY_MS = 7_000
export const MAX_APPEARANCE_DELAY_MS = 40_000

export type ShootingStarFlight = {
  id: number
  sx: number
  sy: number
  ex: number
  ey: number
  angle: number
  duration: number
}

type Viewport = { width: number; height: number }
type MutableLock = { current: boolean }

export function appearanceDelay(randomValue = Math.random()) {
  const normalized = Math.min(1, Math.max(0, randomValue))
  return MIN_APPEARANCE_DELAY_MS
    + normalized * (MAX_APPEARANCE_DELAY_MS - MIN_APPEARANCE_DELAY_MS)
}

export function shouldScheduleStar(
  hasPendingWish: boolean,
  pageVisible: boolean,
  hasActiveFlight: boolean,
) {
  return hasPendingWish && pageVisible && !hasActiveFlight
}

export function acquireLock(lock: MutableLock) {
  if (lock.current) return false
  lock.current = true
  return true
}

export function createFlight(
  viewport: Viewport,
  random = Math.random,
  id = Date.now(),
): ShootingStarFlight {
  const fromLeft = random() > 0.5
  const sx = fromLeft ? -180 : viewport.width + 180
  const ex = fromLeft ? viewport.width + 220 : -220
  const sy = Math.round(viewport.height * (0.08 + random() * 0.35))
  const ey = Math.round(viewport.height * (0.5 + random() * 0.38))

  return {
    id,
    sx,
    sy,
    ex,
    ey,
    angle: Math.atan2(ey - sy, ex - sx) * 180 / Math.PI,
    duration: 8 + random() * 2,
  }
}
