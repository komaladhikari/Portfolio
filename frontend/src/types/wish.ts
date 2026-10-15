export type WishStatus = 'pending' | 'granted'
export type WishVisibility = 'public' | 'private'

export type WishCredential = {
  id: string
  claimToken: string
}

export type OwnedWish = WishCredential & {
  status: WishStatus
  createdAt: string
  grantedAt: string | null
}

export type SkyWish = {
  id: string
  text: string
  visibility: WishVisibility
  x: number
  y: number
}
