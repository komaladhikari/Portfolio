import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  WishApiError,
  createWish,
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

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/api/wishes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'A thoughtful wish', visibility: 'private' }),
    })
  })

  it('sends claim tokens only in private headers', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({
        id: 'wish-id', status: 'pending', created_at: 'now', granted_at: null,
      }))
      .mockResolvedValueOnce(jsonResponse({
        id: 'wish-id', status: 'granted', granted_at: 'later',
      }))

    await getWishStatus('wish-id', 'private-token')
    await grantWish('wish-id', 'private-token')

    const calls = vi.mocked(fetch).mock.calls
    expect(calls[0][0]).not.toContain('private-token')
    expect(calls[1][0]).not.toContain('private-token')
    expect(calls[0][1]?.headers).toEqual({ 'X-Claim-Token': 'private-token' })
    expect(calls[1][1]?.headers).toEqual({ 'X-Claim-Token': 'private-token' })
  })

  it('loads public stars without credentials', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({
      stars: [{ id: 'star', x: 10, y: 20, visibility: 'public', text: 'A wish' }],
      limit: 100,
      offset: 0,
    }))

    const stars = await getSharedSky()

    expect(stars).toHaveLength(1)
    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/api/sky?limit=100&offset=0',
      undefined,
    )
  })

  it('turns backend failures into typed errors', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ detail: 'Invalid claim token.' }, 403))

    await expect(getWishStatus('wish-id', 'bad-token')).rejects.toEqual(
      new WishApiError(403, 'Invalid claim token.'),
    )
  })
})
