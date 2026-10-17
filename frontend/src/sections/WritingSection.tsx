import { useCallback, useEffect, useState } from 'react'
import { SectionLabel } from '../components/SectionLabel'
import { WritingCard } from '../components/WritingCard'
import { SUBSTACK_URL } from '../data/writing'
import { getWritingPosts } from '../services/writingApi'
import type { WritingPost } from '../types/content'

export function WritingSection() {
  const [posts, setPosts] = useState<WritingPost[]>([])
  const [feedState, setFeedState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading')

  const loadPosts = useCallback(() => {
    setFeedState('loading')
    getWritingPosts()
      .then((nextPosts) => {
        setPosts(nextPosts)
        setFeedState(nextPosts.length > 0 ? 'ready' : 'empty')
      })
      .catch(() => setFeedState('error'))
  }, [])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return (
    <section className="writing-section" id="writing" data-reveal aria-labelledby="writing-title">
      <header className="writing-heading">
        <SectionLabel>Writing</SectionLabel>
        <h2 id="writing-title">Little Pieces of My Mind</h2>
        <p>Thoughts on growing, building, questioning old beliefs, and figuring out the world as I go.</p>
      </header>

      <div className="writing-grid" aria-busy={feedState === 'loading'} aria-live="polite">
        {feedState === 'loading' && Array.from({ length: 3 }, (_, index) => (
          <div className="writing-card writing-card-placeholder" aria-hidden="true" key={index}>
            <span />
            <span />
            <span />
          </div>
        ))}
        {feedState === 'ready' && posts.map((post) => <WritingCard post={post} key={post.url} />)}
        {feedState === 'empty' && (
          <p className="writing-feed-message">No published pieces are available yet.</p>
        )}
        {feedState === 'error' && (
          <div className="writing-feed-message">
            <p>The writing shelf could not be reached right now.</p>
            <button type="button" onClick={loadPosts}>Try again</button>
          </div>
        )}
      </div>

      <a className="substack-button" href={SUBSTACK_URL} target="_blank" rel="noreferrer">
        Find me on Substack <span>↗</span>
      </a>
    </section>
  )
}
