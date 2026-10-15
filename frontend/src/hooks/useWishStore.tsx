import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  WishApiError,
  createWish,
  getSharedSky,
  getWishStatus,
  grantWish as grantWishRequest,
} from '../services/wishApi'
import { loadWishCredentials, saveWishCredentials } from '../services/wishStorage'
import type { OwnedWish, SkyWish, WishCredential, WishVisibility } from '../types/wish'

type WishStore = {
  wishes: OwnedWish[]
  pendingWish?: OwnedWish
  grantedWishes: SkyWish[]
  isLoadingSky: boolean
  isLoadingMoreSky: boolean
  hasMoreSky: boolean
  skyError: string | null
  error: string | null
  submitWish: (text: string, isPrivate: boolean) => Promise<void>
  grantWish: (wishId: string) => Promise<boolean>
  clearError: () => void
  refreshSky: () => Promise<void>
  loadMoreSky: () => Promise<void>
}

const SKY_PAGE_SIZE = 50

const WishContext = createContext<WishStore | null>(null)

function errorMessage(error: unknown) {
  if (error instanceof WishApiError) return error.message
  return 'The sky could not be reached. Check your connection and try again.'
}

export function WishProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<WishCredential[]>(loadWishCredentials)
  const [wishes, setWishes] = useState<OwnedWish[]>([])
  const [grantedWishes, setGrantedWishes] = useState<SkyWish[]>([])
  const [isLoadingSky, setIsLoadingSky] = useState(true)
  const [isLoadingMoreSky, setIsLoadingMoreSky] = useState(false)
  const [hasMoreSky, setHasMoreSky] = useState(false)
  const [skyError, setSkyError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const skyVersion = useRef(0)
  const loadingMoreSky = useRef(false)

  const clearError = useCallback(() => setError(null), [])

  const refreshSky = useCallback(async () => {
    const version = skyVersion.current + 1
    skyVersion.current = version
    setIsLoadingSky(true)
    setSkyError(null)
    try {
      const page = await getSharedSky(SKY_PAGE_SIZE, 0)
      if (skyVersion.current !== version) return
      setGrantedWishes(page.stars)
      setHasMoreSky(page.stars.length === page.limit)
    } catch (requestError) {
      if (skyVersion.current === version) setSkyError(errorMessage(requestError))
    } finally {
      if (skyVersion.current === version) setIsLoadingSky(false)
    }
  }, [])

  const loadMoreSky = useCallback(async () => {
    if (loadingMoreSky.current || !hasMoreSky) return
    loadingMoreSky.current = true
    const version = skyVersion.current
    const offset = grantedWishes.length
    setIsLoadingMoreSky(true)
    setSkyError(null)
    try {
      const page = await getSharedSky(SKY_PAGE_SIZE, offset)
      if (skyVersion.current !== version) return
      setGrantedWishes((current) => {
        const wishesById = new Map(current.map((wish) => [wish.id, wish]))
        page.stars.forEach((wish) => wishesById.set(wish.id, wish))
        return [...wishesById.values()]
      })
      setHasMoreSky(page.stars.length === page.limit)
    } catch (requestError) {
      if (skyVersion.current === version) setSkyError(errorMessage(requestError))
    } finally {
      loadingMoreSky.current = false
      setIsLoadingMoreSky(false)
    }
  }, [grantedWishes.length, hasMoreSky])

  useEffect(() => {
    try {
      saveWishCredentials(credentials)
    } catch {
      setError('Your browser could not save the private wish key.')
    }
  }, [credentials])

  useEffect(() => {
    let active = true

    async function restoreOwnedWishes() {
      const results = await Promise.all(credentials.map(async (credential) => {
        try {
          const status = await getWishStatus(credential.id, credential.claimToken)
          return {
            credential,
            wish: {
              ...credential,
              status: status.status,
              createdAt: status.created_at,
              grantedAt: status.granted_at,
            } satisfies OwnedWish,
          }
        } catch (requestError) {
          if (requestError instanceof WishApiError && [403, 404].includes(requestError.status)) {
            return { credential, wish: null }
          }
          if (active) setError(errorMessage(requestError))
          return { credential, wish: undefined }
        }
      }))

      if (!active) return
      const invalidIds = new Set(
        results.filter((result) => result.wish === null).map((result) => result.credential.id),
      )
      if (invalidIds.size) {
        setCredentials((current) => current.filter((item) => !invalidIds.has(item.id)))
      }
      setWishes((current) => {
        const restored = new Map(current.map((wish) => [wish.id, wish]))
        results.forEach((result) => {
          if (result.wish) restored.set(result.wish.id, result.wish)
          if (result.wish === null) restored.delete(result.credential.id)
        })
        return [...restored.values()]
      })
    }

    void restoreOwnedWishes()
    return () => { active = false }
  }, [credentials])

  useEffect(() => {
    void refreshSky()
  }, [refreshSky])

  const submitWish = useCallback(async (text: string, isPrivate: boolean) => {
    setError(null)
    const visibility: WishVisibility = isPrivate ? 'private' : 'public'
    try {
      const created = await createWish(text, visibility)
      const credential = { id: created.id, claimToken: created.claim_token }
      setCredentials((current) => [
        ...current.filter((item) => item.id !== credential.id),
        credential,
      ])
      setWishes((current) => [
        ...current.filter((wish) => wish.id !== created.id),
        {
          ...credential,
          status: created.status,
          createdAt: new Date().toISOString(),
          grantedAt: null,
        },
      ])
    } catch (requestError) {
      setError(errorMessage(requestError))
      throw requestError
    }
  }, [])

  const grantWish = useCallback(async (wishId: string) => {
    const credential = credentials.find((item) => item.id === wishId)
    if (!credential) {
      setError('The private key for this wish is missing.')
      return false
    }

    setError(null)
    try {
      const granted = await grantWishRequest(wishId, credential.claimToken)
      setWishes((current) => current.map((wish) => (
        wish.id === wishId
          ? { ...wish, status: granted.status, grantedAt: granted.granted_at }
          : wish
      )))
      await refreshSky()
      return true
    } catch (requestError) {
      if (requestError instanceof WishApiError && [403, 404].includes(requestError.status)) {
        setCredentials((current) => current.filter((item) => item.id !== wishId))
        setWishes((current) => current.filter((wish) => wish.id !== wishId))
      }
      setError(errorMessage(requestError))
      return false
    }
  }, [credentials, refreshSky])

  const value = useMemo<WishStore>(() => ({
    wishes,
    pendingWish: wishes.find((wish) => wish.status === 'pending'),
    grantedWishes,
    isLoadingSky,
    isLoadingMoreSky,
    hasMoreSky,
    skyError,
    error,
    submitWish,
    grantWish,
    clearError,
    refreshSky,
    loadMoreSky,
  }), [
    wishes,
    grantedWishes,
    isLoadingSky,
    isLoadingMoreSky,
    hasMoreSky,
    skyError,
    error,
    submitWish,
    grantWish,
    clearError,
    refreshSky,
    loadMoreSky,
  ])

  return <WishContext.Provider value={value}>{children}</WishContext.Provider>
}

export function useWishStore() {
  const context = useContext(WishContext)
  if (!context) throw new Error('useWishStore must be used inside WishProvider')
  return context
}
