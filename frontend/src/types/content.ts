export type Project = {
  number: string
  title: string
  description: string
  tags: string[]
  github: string
  demo: string
  accent: 'rose' | 'violet'
}

export type WritingPost = {
  status: string
  title: string
  excerpt: string
  url: string
}
