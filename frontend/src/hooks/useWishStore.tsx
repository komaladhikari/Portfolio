import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadWishes, saveWishes, stableStarPosition } from '../services/wishStorage'
import type { Wish } from '../types/wish'

type WishStore = {
  wishes: Wish[]
  pendingWish?: Wish
  grantedWishes: Wish[]
  submitWish: (text: string, isPrivate: boolean) => void
  grantWish: (wishId: string) => boolean
}

const WishContext = createContext<WishStore | null>(null)

export function WishProvider({ children }: { children: ReactNode }) {
  const [wishes, setWishes] = useState<Wish[]>(loadWishes)

  useEffect(() => {
    saveWishes(wishes)
  }, [wishes])

  const value = useMemo<WishStore>(() => ({
    wishes,
    pendingWish: wishes.find((wish) => wish.status === 'pending'),
    grantedWishes: wishes.filter((wish) => wish.status === 'granted'),
    submitWish: (text, isPrivate) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const position = stableStarPosition(id)
      setWishes((current) => [
        ...current,
        { id, text, isPrivate, status: 'pending', createdAt: Date.now(), ...position },
      ])
    },
    grantWish: (wishId) => {
      const canGrant = wishes.some((wish) => wish.id === wishId && wish.status === 'pending')
      if (!canGrant) return false
      setWishes((current) => current.map((wish) => {
        if (wish.id !== wishId || wish.status !== 'pending') return wish
        return { ...wish, status: 'granted' }
      }))
      return true
    },
  }), [wishes])

  return <WishContext.Provider value={value}>{children}</WishContext.Provider>
}

export function useWishStore() {
  const context = useContext(WishContext)
  if (!context) throw new Error('useWishStore must be used inside WishProvider')
  return context
}
