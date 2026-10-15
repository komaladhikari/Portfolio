export type WishStatus = 'pending' | 'granted'

export type Wish = {
  id: string
  text: string
  isPrivate: boolean
  status: WishStatus
  x: number
  y: number
  createdAt: number
}
