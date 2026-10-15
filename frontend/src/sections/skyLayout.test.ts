import { describe, expect, it } from 'vitest'

import type { SkyWish } from '../types/wish'
import { layoutSkyStars } from './skyLayout'


const stars: SkyWish[] = [
  { id: 'first', text: 'One', visibility: 'public', x: 50, y: 50 },
  { id: 'second', text: 'Two', visibility: 'private', x: 50, y: 50 },
]

describe('Shared Sky display layout', () => {
  it('keeps a non-overlapping stored position unchanged', () => {
    expect(layoutSkyStars(stars.slice(0, 1))[0]).toEqual(stars[0])
  })

  it('deterministically separates visibly overlapping wish stars', () => {
    const firstLayout = layoutSkyStars(stars)
    const secondLayout = layoutSkyStars(stars)

    expect(firstLayout).toEqual(secondLayout)
    expect(firstLayout[0]).toEqual(stars[0])
    expect(firstLayout[1].x).not.toBe(stars[1].x)
    expect(Math.hypot(
      firstLayout[0].x - firstLayout[1].x,
      firstLayout[0].y - firstLayout[1].y,
    )).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps adjusted positions inside the visible field', () => {
    const edgeStars = stars.map((star) => ({ ...star, x: 0, y: 100 }))

    for (const star of layoutSkyStars(edgeStars)) {
      expect(star.x).toBeGreaterThanOrEqual(4)
      expect(star.x).toBeLessThanOrEqual(96)
      expect(star.y).toBeGreaterThanOrEqual(4)
      expect(star.y).toBeLessThanOrEqual(96)
    }
  })
})
