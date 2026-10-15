import { describe, expect, it } from 'vitest'

import {
  MAX_APPEARANCE_DELAY_MS,
  MIN_APPEARANCE_DELAY_MS,
  acquireLock,
  appearanceDelay,
  createFlight,
  shouldScheduleStar,
} from './shootingStar'


describe('shooting-star lifecycle helpers', () => {
  it('keeps randomized appearance delays between 7 and 40 seconds', () => {
    expect(appearanceDelay(0)).toBe(MIN_APPEARANCE_DELAY_MS)
    expect(appearanceDelay(0.5)).toBe(23_500)
    expect(appearanceDelay(1)).toBe(MAX_APPEARANCE_DELAY_MS)
  })

  it('schedules only for a visible pending wish with no active star', () => {
    expect(shouldScheduleStar(true, true, false)).toBe(true)
    expect(shouldScheduleStar(false, true, false)).toBe(false)
    expect(shouldScheduleStar(true, false, false)).toBe(false)
    expect(shouldScheduleStar(true, true, true)).toBe(false)
  })

  it('allows only one grant request to acquire the in-flight lock', () => {
    const lock = { current: false }

    expect(acquireLock(lock)).toBe(true)
    expect(acquireLock(lock)).toBe(false)

    lock.current = false
    expect(acquireLock(lock)).toBe(true)
  })

  it('creates a deterministic flight inside the viewport height', () => {
    const values = [0.75, 0.5, 0.25, 0.5]
    const flight = createFlight(
      { width: 1_000, height: 800 },
      () => values.shift() ?? 0,
      123,
    )

    expect(flight).toMatchObject({
      id: 123,
      sx: -180,
      ex: 1_220,
      sy: 204,
      ey: 476,
      duration: 7,
    })
    expect(flight.angle).toBeGreaterThan(0)
  })
})
