export type Project = {
  number: string
  title: string
  description: string
  tags: string[]
  github: string
  repositoryType?: 'github' | 'bitbucket'
  demo?: string
  accent: 'rose' | 'violet'
}

export type WritingPost = {
  title: string
  excerpt: string
  url: string
  publishedAt: string
}
