import type { WritingPost } from '../types/content'

type WritingCardProps = {
  post: WritingPost
}

export function WritingCard({ post }: WritingCardProps) {
  const publishedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(post.publishedAt))

  return (
    <article className="writing-card">
      <time className="writing-status" dateTime={post.publishedAt}>{publishedDate}</time>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <a href={post.url} target="_blank" rel="noreferrer">
        Read More <span>→</span>
      </a>
    </article>
  )
}
