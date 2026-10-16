type MutableLock = { current: boolean }

export function prepareUniqueWishes(values: string[]) {
  const seen = new Set<string>()
  const wishes: string[] = []

  for (const value of values) {
    const wish = value.trim()
    if (!wish || seen.has(wish)) continue
    seen.add(wish)
    wishes.push(wish)
  }

  return wishes
}

export function acquireSubmissionLock(lock: MutableLock) {
  if (lock.current) return false
  lock.current = true
  return true
}

export async function submitWishesInOrder(
  wishes: string[],
  submit: (wish: string) => Promise<void>,
) {
  for (let index = 0; index < wishes.length; index += 1) {
    try {
      await submit(wishes[index])
    } catch {
      return wishes.slice(index)
    }
  }
  return []
}
