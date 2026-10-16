import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ScrapbookContent } from '../components/moreBuilding/ScrapbookContent'
import { skyCategories, type SkyCategory } from '../data/moreBuilding'

const placeholderClouds = [
  { left: '-5%', top: '8%', size: '130px', fill: '#f8f3ff', duration: '9.2s', delay: '-2.5s' },
  { left: '19%', top: '35%', size: '92px', fill: '#f8e8f2', duration: '11s', delay: '-6.1s' },
  { left: '31%', top: '73%', size: '175px', fill: '#eee5fb', duration: '9.7s', delay: '-4s' },
  { left: '54%', top: '24%', size: '112px', fill: '#f8f3ff', duration: '10.4s', delay: '-7.2s' },
  { left: '67%', top: '76%', size: '240px', fill: '#f8e8f2', duration: '12s', delay: '-3.2s' },
  { left: '86%', top: '3%', size: '165px', fill: '#eee5fb', duration: '8.8s', delay: '-5.5s' },
  { left: '-2%', top: '70%', size: '210px', fill: '#f8e8f2', duration: '11.4s', delay: '-8s' },
  { left: '76%', top: '40%', size: '86px', fill: '#f8f3ff', duration: '9.5s', delay: '-1.7s' },
  { left: '45%', top: '91%', size: '125px', fill: '#eee5fb', duration: '10.8s', delay: '-6.8s' },
]

export function MoreBuildingSky() {
  const [selectedCategory, setSelectedCategory] = useState<SkyCategory | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const selectedCloudRef = useRef<HTMLButtonElement | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  const openCategory = (category: SkyCategory, cloud: HTMLButtonElement) => {
    selectedCloudRef.current = cloud
    setIsClosing(false)
    setSelectedCategory(category)
  }

  const closeCategory = () => {
    if (closeTimerRef.current !== null) return
    setIsClosing(true)
    closeTimerRef.current = window.setTimeout(() => {
      setSelectedCategory(null)
      setIsClosing(false)
      closeTimerRef.current = null
      requestAnimationFrame(() => selectedCloudRef.current?.focus())
    }, 240)
  }

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
  }, [])

  useEffect(() => {
    if (!selectedCategory) return

    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCategory()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedCategory])

  return (
    <section className="building-sky" data-reveal aria-labelledby="building-sky-title">
      <div className="building-sky-stars" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
      </div>

      <header className="building-sky-heading">
        <a className="back-to-projects" href="#/projects">← Back to Projects</a>
        <p className="section-label">A little hidden sky</p>
        <h1 id="building-sky-title">More of I'm Building</h1>
        <p>Some things are still becoming. Some are just things I love.</p>
      </header>

      <div className={`cloud-scape ${selectedCategory ? 'has-open-panel' : ''}`}>
        <div className="painted-cloud cloud-haze-one" aria-hidden="true" />
        <div className="painted-cloud cloud-haze-two" aria-hidden="true" />

        {skyCategories.map((category, index) => (
          <button
            className={`explorer-cloud cloud-position-${index + 1}`}
            type="button"
            key={category.id}
            onClick={(event) => openCategory(category, event.currentTarget)}
            aria-haspopup="dialog"
          >
            <svg className="explorer-cloud-shape" viewBox="0 0 160 100" aria-hidden="true">
              <path d="M24 86C11 86 3 78 3 67S12 47 25 46C27 29 41 17 58 17C71 17 82 24 88 36C93 31 100 29 107 29C122 29 133 40 134 53C148 54 157 63 157 74C157 81 151 86 140 86H24Z" />
            </svg>
            <span className="explorer-cloud-icon" aria-hidden="true">{category.icon}</span>
            <span>{category.title}</span>
          </button>
        ))}

        {placeholderClouds.map((cloud, index) => (
          <svg
            className="placeholder-cloud"
            viewBox="0 0 160 100"
            aria-hidden="true"
            key={index}
            style={{
              '--placeholder-size': cloud.size,
              left: cloud.left,
              top: cloud.top,
              fill: cloud.fill,
              animationDuration: cloud.duration,
              animationDelay: cloud.delay,
            } as CSSProperties}
          >
            <path d="M24 86C11 86 3 78 3 67S12 47 25 46C27 29 41 17 58 17C71 17 82 24 88 36C93 31 100 29 107 29C122 29 133 40 134 53C148 54 157 63 157 74C157 81 151 86 140 86H24Z" />
          </svg>
        ))}
      </div>

      {selectedCategory && (
        <div className={`sky-panel-layer ${isClosing ? 'is-closing' : ''}`} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeCategory()
        }}>
          <section
            className={`sky-content-panel panel-${selectedCategory.kind}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sky-panel-title"
          >
            <button
              className="sky-panel-close"
              type="button"
              onClick={closeCategory}
              ref={closeButtonRef}
              aria-label="Back to the sky"
            >
              ×
            </button>

            <span className="sky-panel-icon" aria-hidden="true">{selectedCategory.icon}</span>
            <p className="section-label">{selectedCategory.kind.replace('-', ' ')}</p>
            <h2 id="sky-panel-title">{selectedCategory.title}</h2>
            <p className="sky-panel-intro">{selectedCategory.introduction}</p>

            <div className="sky-panel-items"><ScrapbookContent category={selectedCategory} /></div>

            <button className="back-to-sky" type="button" onClick={closeCategory}>← Back to the Sky</button>
          </section>
        </div>
      )}
    </section>
  )
}
