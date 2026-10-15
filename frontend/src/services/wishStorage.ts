import type { WishCredential } from '../types/wish'

const STORAGE_KEY = 'komal-portfolio-wish-credentials'
const LEGACY_STORAGE_KEY = 'komal-portfolio-wishes'

function isWishCredential(value: unknown): value is WishCredential {
  if (!value || typeof value !== 'object') return false
  const credential = value as Record<string, unknown>
  return typeof credential.id === 'string' && typeof credential.claimToken === 'string'
}

export function loadWishCredentials(): WishCredential[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isWishCredential) : []
  } catch {
    return []
  } finally {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // Storage may be disabled; callers still receive an empty credential list.
    }
  }
}

export function saveWishCredentials(credentials: WishCredential[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
}
