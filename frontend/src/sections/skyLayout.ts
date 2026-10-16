import type { SkyWish } from '../types/wish'

const EDGE_MARGIN = 4
const MIN_DISTANCE = 4.5

function clamp(value: number) {
  return Math.min(100 - EDGE_MARGIN, Math.max(EDGE_MARGIN, value))
}

function idAngle(id: string) {
  let hash = 0
  for (const character of id) hash = ((hash * 31) + character.charCodeAt(0)) >>> 0
  return (hash % 360) * Math.PI / 180
}

function overlaps(
  x: number,
  y: number,
  placed: SkyWish[],
) {
  return placed.some((star) => Math.hypot(star.x - x, star.y - y) < MIN_DISTANCE)
}

export function layoutSkyStars(stars: SkyWish[]): SkyWish[] {
  const placed: SkyWish[] = []

  for (const star of stars) {
    const originalX = clamp(star.x)
    const originalY = clamp(star.y)
    let x = originalX
    let y = originalY

    if (overlaps(x, y, placed)) {
      const startingAngle = idAngle(star.id)
      for (let candidate = 0; candidate < 24; candidate += 1) {
        const ring = Math.floor(candidate / 8) + 1
        const angle = startingAngle + (candidate % 8) * Math.PI / 4
        const candidateX = clamp(originalX + Math.cos(angle) * ring * MIN_DISTANCE)
        const candidateY = clamp(originalY + Math.sin(angle) * ring * MIN_DISTANCE)
        if (!overlaps(candidateX, candidateY, placed)) {
          x = candidateX
          y = candidateY
          break
        }
      }
    }

    placed.push({ ...star, x, y })
  }

  return placed
}
