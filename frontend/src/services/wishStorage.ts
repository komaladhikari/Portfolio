import type { Wish } from '../types/wish'

const STORAGE_KEY = 'komal-portfolio-wishes'

export function loadWishes(): Wish[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Wish[]
  } catch {
    return []
  }
}

export function saveWishes(wishes: Wish[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes))
}

export function stableStarPosition(id: string) {
  const hash = [...id].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 7)
  return {
    x: 8 + (hash % 84),
    y: 12 + ((hash >>> 8) % 70),
  }
}
