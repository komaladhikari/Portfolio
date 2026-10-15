import type { WritingPost } from '../types/content'

type WritingCardProps = {
  post: WritingPost
}

export function WritingCard({ post }: WritingCardProps) {
  return (
    <article className="writing-card">
      <span className="writing-status">{post.status}</span>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <a href={post.url} target="_blank" rel="noreferrer">
        Read More <span>→</span>
      </a>
    </article>
  )
}
