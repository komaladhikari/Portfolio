import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  WishApiError,
  createWish,
  deleteWish,
  getSharedSky,
  getWishStatus,
  grantWish,
} from './wishApi'


function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('wish API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('creates a wish with the backend visibility contract', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({
      id: 'wish-id',
      claim_token: 'private-token',
      status: 'pending',
    }, 201))

    await createWish('A thoughtful wish', 'private')

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/wishes', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'A thoughtful wish', visibility: 'private' }),
      signal: expect.any(AbortSignal),
    }))
  })

  it('sends claim tokens only in private headers', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({
        id: 'wish-id', status: 'pending', created_at: 'now', granted_at: null,
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'wish-id', status: 'granted', granted_at: 'later',
      }))
      .mockResolvedValueOnce(jsonResponse({ id: 'wish-id', deleted: true }))

    await getWishStatus('wish-id', 'private-token')
    await grantWish('wish-id', 'private-token')
    await deleteWish('wish-id', 'private-token')

    const calls = vi.mocked(fetch).mock.calls
    expect(calls[0][0]).not.toContain('private-token')
    expect(calls[1][0]).not.toContain('private-token')
    expect(calls[2][0]).not.toContain('private-token')
    expect(calls[0][1]?.headers).toEqual({ 'X-Claim-Token': 'private-token' })
    expect(calls[1][1]?.headers).toEqual({ 'X-Claim-Token': 'private-token' })
    expect(calls[2][1]).toEqual(expect.objectContaining({
      method: 'DELETE',
      headers: { 'X-Claim-Token': 'private-token' },
    }))
  })

  it('loads public stars without credentials', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({
      stars: [{ id: 'star', x: 10, y: 20, visibility: 'public', text: 'A wish' }],
      limit: 100,
      offset: 0,
    }))

    const page = await getSharedSky(50, 100)

    expect(page.stars).toHaveLength(1)
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/sky?limit=50&offset=100',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('turns backend failures into typed errors', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: 'Invalid claim token.' }, 403))

    await expect(getWishStatus('wish-id', 'bad-token')).rejects.toEqual(
      new WishApiError(403, 'Invalid claim token.'),
    )
  })

  it('propagates network failures without returning stale data', async () => {
    const networkFailure = new TypeError('Failed to fetch')
    vi.mocked(fetch).mockRejectedValue(networkFailure)

    await expect(getSharedSky()).rejects.toBe(networkFailure)
  })
})
