import { SectionLabel } from '../components/SectionLabel'
import { WritingCard } from '../components/WritingCard'
import { SUBSTACK_URL, writingPosts } from '../data/writing'

export function WritingSection() {
  return (
    <section className="writing-section" id="writing" aria-labelledby="writing-title">
      <header className="writing-heading">
        <SectionLabel>Writing</SectionLabel>
        <h2 id="writing-title">Little Pieces of My Mind</h2>
        <p>Thoughts on growing, building, questioning old beliefs, and figuring out the world as I go.</p>
      </header>

      <div className="writing-grid">
        {writingPosts.map((post) => <WritingCard post={post} key={post.title} />)}
      </div>

      <a className="substack-button" href={SUBSTACK_URL} target="_blank" rel="noreferrer">
        Find me on Substack <span>↗</span>
      </a>
    </section>
  )
}
