import type { WritingPost } from '../types/content'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000)

type WritingFeedResponse = {
  posts: Array<{ title: string; excerpt: string; url: string; published_at: string }>
}

export async function getWritingPosts(): Promise<WritingPost[]> {
  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_BASE_URL}/api/writing?limit=3`, { signal: controller.signal })
    if (!response.ok) throw new Error('Writing could not be loaded.')
    const body = await response.json() as WritingFeedResponse
    return body.posts.map((post) => ({
      title: post.title,
      excerpt: post.excerpt,
      url: post.url,
      publishedAt: post.published_at,
    }))
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
