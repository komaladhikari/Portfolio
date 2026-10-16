import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadWishCredentials, saveWishCredentials } from './wishStorage'


describe('wish credential storage', () => {
  const values = new Map<string, string>()

  beforeEach(() => {
    values.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    })
  })

  it('stores only wish IDs and claim tokens', () => {
    const contaminatedCredential = {
      id: 'wish-id',
      claimToken: 'private-token',
      text: 'must not be stored',
    }
    saveWishCredentials([contaminatedCredential])

    expect(JSON.parse(values.get('komal-portfolio-wish-credentials') ?? '')).toEqual([
      { id: 'wish-id', claimToken: 'private-token' },
    ])
  })

  it('ignores malformed values and clears legacy mock wishes', () => {
    values.set('komal-portfolio-wish-credentials', JSON.stringify([
      { id: 'valid', claimToken: 'token' },
      { id: 'missing-token' },
    ]))
    values.set('komal-portfolio-wishes', JSON.stringify([{ text: 'legacy private text' }]))

    expect(loadWishCredentials()).toEqual([{ id: 'valid', claimToken: 'token' }])
    expect(values.has('komal-portfolio-wishes')).toBe(false)
  })

  it('handles missing storage data as a visitor with no owned wishes', () => {
    expect(loadWishCredentials()).toEqual([])
  })

  it('keeps only the latest token when an ID is duplicated', () => {
    values.set('komal-portfolio-wish-credentials', JSON.stringify([
      { id: 'wish-id', claimToken: 'expired-token' },
      { id: 'wish-id', claimToken: 'current-token' },
      { id: '', claimToken: 'invalid' },
      { id: 'missing-token', claimToken: '' },
    ]))

    expect(loadWishCredentials()).toEqual([
      { id: 'wish-id', claimToken: 'current-token' },
    ])
  })
})
