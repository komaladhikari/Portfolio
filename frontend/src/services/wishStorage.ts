import type { WishCredential } from '../types/wish'

const STORAGE_KEY = 'komal-portfolio-wish-credentials'
const LEGACY_STORAGE_KEY = 'komal-portfolio-wishes'

function isWishCredential(value: unknown): value is WishCredential {
  if (!value || typeof value !== 'object') return false
  const credential = value as Record<string, unknown>
  return typeof credential.id === 'string'
    && credential.id.trim().length > 0
    && typeof credential.claimToken === 'string'
    && credential.claimToken.trim().length > 0
}

function uniqueCredentials(values: unknown[]): WishCredential[] {
  const credentials = new Map<string, WishCredential>()
  values.forEach((value) => {
    if (isWishCredential(value)) {
      credentials.set(value.id, {
        id: value.id,
        claimToken: value.claimToken,
      })
    }
  })
  return [...credentials.values()]
}

export function loadWishCredentials(): WishCredential[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? uniqueCredentials(parsed) : []
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueCredentials(credentials)))
}
