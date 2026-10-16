import { describe, expect, it } from 'vitest'

import {
  acquireSubmissionLock,
  prepareUniqueWishes,
  submitWishesInOrder,
} from './wishSubmission'


describe('wish submission safeguards', () => {
  it('trims input and removes duplicate fields from one submission', () => {
    expect(prepareUniqueWishes([
      '  A peaceful year  ',
      '',
      'A peaceful year',
      'A healthy family',
    ])).toEqual(['A peaceful year', 'A healthy family'])
  })

  it('allows only one submission to hold the synchronous lock', () => {
    const lock = { current: false }

    expect(acquireSubmissionLock(lock)).toBe(true)
    expect(acquireSubmissionLock(lock)).toBe(false)

    lock.current = false
    expect(acquireSubmissionLock(lock)).toBe(true)
  })

  it('retries only wishes that were not confirmed before a failure', async () => {
    const submitted: string[] = []
    const remaining = await submitWishesInOrder(
      ['first', 'second', 'third'],
      async (wish) => {
        if (wish === 'second') throw new Error('network failure')
        submitted.push(wish)
      },
    )

    expect(submitted).toEqual(['first'])
    expect(remaining).toEqual(['second', 'third'])
  })
})
