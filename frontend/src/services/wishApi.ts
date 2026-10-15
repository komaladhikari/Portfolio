import type { SkyWish, WishStatus, WishVisibility } from '../types/wish'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000)

type CreatedWish = { id: string; claim_token: string; status: WishStatus }
type WishStatusResponse = {
  id: string
  status: WishStatus
  created_at: string
  granted_at: string | null
}
type GrantedWish = { id: string; status: WishStatus; granted_at: string }
export type SharedSkyResponse = {
  stars: SkyWish[]
  limit: number
  offset: number
}

export class WishApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'WishApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal })
    if (!response.ok) {
      let message = 'The sky could not be reached. Please try again.'
      try {
        const body = await response.json() as { detail?: string }
        if (body.detail) message = body.detail
      } catch {
        // Keep the safe fallback when the server does not return JSON.
      }
      throw new WishApiError(response.status, message)
    }
    return response.json() as Promise<T>
  } finally {
    globalThis.clearTimeout(timeout)
  }
}

export function createWish(text: string, visibility: WishVisibility) {
  return request<CreatedWish>('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, visibility }),
  })
}

export function getWishStatus(wishId: string, claimToken: string) {
  return request<WishStatusResponse>(`/api/wishes/${encodeURIComponent(wishId)}/status`, {
    headers: { 'X-Claim-Token': claimToken },
  })
}

export function grantWish(wishId: string, claimToken: string) {
  return request<GrantedWish>(`/api/wishes/${encodeURIComponent(wishId)}/grant`, {
    method: 'POST',
    headers: { 'X-Claim-Token': claimToken },
  })
}

export function getSharedSky(limit = 50, offset = 0) {
  const parameters = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  return request<SharedSkyResponse>(`/api/sky?${parameters}`)
}
