export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="intro-title">
      <div className="hero-copy">
        <p className="hello">Hello, sky wanderer.</p>
        <h1 id="intro-title">Hi, I’m Komal.</h1>
        <p className="tagline">
          A curious mind somewhere between code, research, and
          <br className="desktop-break" /> everything in between.
        </p>
        <div className="actions">
          <a className="button primary" href="#/projects">Explore My Work</a>
          <a className="button secondary" href="#/about">A Little About Me</a>
        </div>
      </div>
      <a className="scroll-cue" href="#shared-sky" aria-label="Scroll to Shared Sky">
        <span>Scroll to discover</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 7 7 7-7" /></svg>
      </a>
    </section>
  )
}
