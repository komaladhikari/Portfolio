import { useEffect, type ReactNode } from 'react'
import heroSky from './assets/dream-sky-hero.png'
import { Navigation } from './components/Navigation'
import { ShootingStarManager } from './components/wishes/ShootingStarManager'
import { WishComposer } from './components/wishes/WishComposer'
import { useHashRoute, type RouteName } from './hooks/useHashRoute'
import { useScrollReveal } from './hooks/useScrollReveal'
import { WishProvider } from './hooks/useWishStore'
import { AboutSection } from './sections/AboutSection'
import { ContactSection } from './sections/ContactSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { ResearchSection } from './sections/ResearchSection'
import { SharedSkySection } from './sections/SharedSkySection'
import { SkyTransition } from './sections/SkyTransition'
import { WritingSection } from './sections/WritingSection'

function Portfolio() {
  const route = useHashRoute()
  useScrollReveal(route)

  useEffect(() => {
    if (route === 'shared-sky') {
      requestAnimationFrame(() => document.querySelector('#shared-sky')?.scrollIntoView({ behavior: 'smooth' }))
    }
  }, [route])

  const pages: Partial<Record<RouteName, ReactNode>> = {
    about: <AboutSection />,
    projects: <ProjectsSection />,
    research: <ResearchSection />,
    writing: <WritingSection />,
    contact: <ContactSection />,
  }
  const page = pages[route]

  return (
    <main
      className={`home route-${route}`}
      id="home"
      style={{ '--hero-image': `url(${heroSky})` } as React.CSSProperties}
    >
      <Navigation activeRoute={route} />

      {route === 'home' || route === 'shared-sky' ? (
        <div className="home-journey">
          <HeroSection />
          <SkyTransition />
          <SharedSkySection />
        </div>
      ) : (
        <div className="route-page-shell">{page}</div>
      )}

      <WishComposer />
      <ShootingStarManager />
      <div className="edge-sparkle top" aria-hidden="true">✦</div>
    </main>
  )
}

function App() {
  return <WishProvider><Portfolio /></WishProvider>
}

export default App
