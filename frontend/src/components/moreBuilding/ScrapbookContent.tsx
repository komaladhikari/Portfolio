import { useState } from 'react'
import {
  buildingProjects,
  funFacts,
  galleryPhotos,
  littleIdeas,
  personalInterests,
  selectedVideos,
  youtubeChannelUrl,
  type GalleryPhoto,
  type SkyCategory,
} from '../../data/moreBuilding'

function ImagePlaceholder({ label }: { label: string }) {
  return <div className="scrapbook-image-placeholder" aria-label={label}><span>✦</span><small>{label}</small></div>
}

function ProjectsContent() {
  return <div className="scrapbook-projects">
    {buildingProjects.map((project) => <article className="scrapbook-project" key={project.title}>
      {project.image ? <img src={project.image} alt={project.imageAlt ?? ''} /> : <ImagePlaceholder label="Add the Alcove introduction image" />}
      <div>
        <span className="sky-item-status">{project.status}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {project.link && <a href={project.link} target="_blank" rel="noreferrer">Visit project ↗</a>}
      </div>
    </article>)}
    <div className="future-project-space">Room for the next thing taking shape ✦</div>
  </div>
}

function GalleryContent() {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  return <>
    <div className="photo-gallery">
      {galleryPhotos.map((photo, index) => <button className={`photo-tile ${photo.orientation}`} type="button" onClick={() => photo.src && setSelectedPhoto(photo)} disabled={!photo.src} key={`${photo.alt}-${index}`}>
        {photo.src ? <img src={photo.src} alt={photo.alt} /> : <ImagePlaceholder label={`Photo ${index + 1}`} />}
        {photo.caption && <span>{photo.caption}</span>}
      </button>)}
    </div>
    {selectedPhoto?.src && <div className="photo-lightbox" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setSelectedPhoto(null)
    }}>
      <figure role="dialog" aria-modal="true" aria-label={selectedPhoto.alt}>
        <button type="button" onClick={() => setSelectedPhoto(null)} aria-label="Close photo">×</button>
        <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
        {selectedPhoto.caption && <figcaption>{selectedPhoto.caption}</figcaption>}
      </figure>
    </div>}
  </>
}

function YouTubeContent() {
  return <div className="youtube-corner">
    <a className="youtube-channel-link" href={youtubeChannelUrl} target="_blank" rel="noreferrer">Visit my YouTube channel ↗</a>
    {selectedVideos.length ? <div className="video-grid">{selectedVideos.map((video) => {
      const href = video.url ?? `https://www.youtube.com/watch?v=${video.youtubeId}`
      const thumbnail = video.thumbnail ?? (video.youtubeId ? `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg` : undefined)
      return <a href={href} target="_blank" rel="noreferrer" key={href}>
        {thumbnail ? <img src={thumbnail} alt="" /> : <ImagePlaceholder label="Add a video thumbnail" />}
        <span>{video.title}</span>
      </a>
    })}</div> : <div className="scrapbook-empty">Selected videos will appear here when you add their IDs or URLs.</div>}
  </div>
}

function IdeasContent() {
  return <div className="small-card-grid">{littleIdeas.map((idea) => <article className="small-scrapbook-card" key={idea.title}>
    {idea.image && <img src={idea.image} alt="" />}
    <span className="sky-item-status">{idea.status}</span><h3>{idea.title}</h3><p>{idea.description}</p>
  </article>)}</div>
}

function InterestsContent() {
  return <div className="small-card-grid">{personalInterests.map((interest) => <article className="small-scrapbook-card" key={interest.title}>
    {interest.image && <img src={interest.image} alt="" />}
    <h3>{interest.title}</h3><p>{interest.description}</p>
    {interest.link && <a href={interest.link} target="_blank" rel="noreferrer">{interest.linkLabel ?? 'Explore'} ↗</a>}
  </article>)}</div>
}

function FactsContent() {
  const [factIndex, setFactIndex] = useState(0)
  const [isChanging, setIsChanging] = useState(false)
  const showAnother = () => {
    if (funFacts.length < 2 || isChanging) return
    setIsChanging(true)
    window.setTimeout(() => {
      setFactIndex((current) => (current + 1 + Math.floor(Math.random() * (funFacts.length - 1))) % funFacts.length)
      setIsChanging(false)
    }, 180)
  }
  return <div className="fun-fact-card"><span aria-hidden="true">✦</span><p className={isChanging ? 'is-changing' : ''}>{funFacts[factIndex]}</p><button type="button" onClick={showAnother} disabled={funFacts.length < 2}>Another one?</button></div>
}

export function ScrapbookContent({ category }: { category: SkyCategory }) {
  switch (category.kind) {
    case 'projects': return <ProjectsContent />
    case 'gallery': return <GalleryContent />
    case 'youtube': return <YouTubeContent />
    case 'ideas': return <IdeasContent />
    case 'interests': return <InterestsContent />
    case 'facts': return <FactsContent />
  }
}
