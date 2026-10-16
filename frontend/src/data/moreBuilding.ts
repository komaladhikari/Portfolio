export type SkyCategory = {
  id: string
  title: string
  icon: string
  kind: 'projects' | 'ideas' | 'gallery' | 'youtube' | 'interests' | 'facts'
  introduction: string
}

export type BuildingProject = {
  title: string
  description: string
  status: string
  image?: string
  imageAlt?: string
  link?: string
}

export type GalleryPhoto = {
  src?: string
  alt: string
  caption?: string
  orientation: 'portrait' | 'landscape'
}

export type YouTubeVideo = {
  title: string
  youtubeId?: string
  url?: string
  thumbnail?: string
}

export type LittleIdea = {
  title: string
  description: string
  status: 'Just an idea' | 'Exploring'
  image?: string
}

export type PersonalInterest = {
  title: string
  description: string
  image?: string
  link?: string
  linkLabel?: string
}

export const skyCategories: SkyCategory[] = [
  { id: 'still-building', title: 'Still Building', icon: '◇', kind: 'projects', introduction: 'Unfinished projects, experiments, and prototypes taking shape.' },
  { id: 'little-ideas', title: 'Little Ideas', icon: '✧', kind: 'ideas', introduction: 'Small thoughts that might grow into something more someday.' },
  { id: 'through-my-lens', title: 'Through My Lens', icon: '⌁', kind: 'gallery', introduction: 'Photographs and quiet moments collected along the way.' },
  { id: 'youtube-corner', title: 'My YouTube Corner', icon: '▷', kind: 'youtube', introduction: 'A home for selected videos and playlists from my corner of YouTube.' },
  { id: 'beyond-the-screen', title: 'Beyond the Screen', icon: '☼', kind: 'interests', introduction: 'Hobbies, creative interests, and the things I enjoy away from code.' },
  { id: 'a-little-about-me', title: 'A Little About Me', icon: '·✦', kind: 'facts', introduction: 'A few small things you might not learn from a résumé.' },
]

// Add more unfinished projects here. Image paths can point to files in /public.
export const buildingProjects: BuildingProject[] = [
  {
    title: 'Alcove',
    description: 'Alcove is a digital home for the things you create. A place to keep songs, writing, drawings, photographs, unfinished ideas, and other creative pieces. You can choose what stays private and what others can discover.',
    status: 'Currently Building',
    imageAlt: 'Introduction to Alcove',
  },
]

// Replace these placeholders with image paths, alt text, and optional captions.
export const galleryPhotos: GalleryPhoto[] = [
  { alt: 'Photo placeholder', caption: 'Add an optional caption.', orientation: 'portrait' },
  { alt: 'Photo placeholder', orientation: 'landscape' },
  { alt: 'Photo placeholder', caption: 'Add an optional caption.', orientation: 'landscape' },
  { alt: 'Photo placeholder', orientation: 'portrait' },
]

export const youtubeChannelUrl = 'https://www.youtube.com/@komaladh33'

// Add a YouTube ID or full URL. Thumbnails are generated from IDs unless overridden.
export const selectedVideos: YouTubeVideo[] = []

export const littleIdeas: LittleIdea[] = [
  { title: 'Add an idea', description: 'Write a short note about something you might like to build someday.', status: 'Just an idea' },
]

export const personalInterests: PersonalInterest[] = [
  { title: 'Add a hobby or interest', description: 'Add an image, a short description, and an optional link.' },
]

// Replace these clearly labeled placeholders with your own facts.
export const funFacts = [
  'Fun fact placeholder — add something small and personal here.',
  'Fun fact placeholder — share another detail visitors would not expect.',
  'Fun fact placeholder — this can be thoughtful, playful, or wonderfully ordinary.',
]
