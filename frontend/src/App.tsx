import heroSky from './assets/dream-sky-hero.png'
import { Navigation } from './components/Navigation'
import { ShootingStarManager } from './components/wishes/ShootingStarManager'
import { WishProvider } from './hooks/useWishStore'
import { AboutSection } from './sections/AboutSection'
import { HeroSection } from './sections/HeroSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SharedSkySection } from './sections/SharedSkySection'
import { WritingSection } from './sections/WritingSection'

function App() {
  return (
    <WishProvider>
      <main
        className="home"
        id="home"
        style={{ '--hero-image': `url(${heroSky})` } as React.CSSProperties}
      >
        <Navigation />
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <WritingSection />
        <SharedSkySection />
        <ShootingStarManager />

        <div className="edge-sparkle top" aria-hidden="true">✦</div>
        <div className="edge-sparkle bottom" aria-hidden="true">✦</div>
      </main>
    </WishProvider>
  )
}

export default App
