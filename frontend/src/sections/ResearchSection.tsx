import { SectionLabel } from '../components/SectionLabel'

export function ResearchSection() {
  return (
    <section className="content-page research-page" data-reveal aria-labelledby="research-title">
      <SectionLabel>Research</SectionLabel>
      <h1 id="research-title">Questions Worth Following</h1>
      <p className="page-lede">I’m exploring physics-informed computer vision and interpretable AI for airport visibility estimation under foggy conditions.</p>
      <div className="research-card">
        <span>Current work · Undergraduate Researcher</span>
        <h2>Physics-Informed AI for Aviation Visibility</h2>
        <p>Investigating backward reasoning and physically meaningful preconditions for explaining model predictions, with evaluation using the Foggy AirSim City Images dataset.</p>
        <div className="project-tags"><span>Computer Vision</span><span>Interpretable AI</span><span>Research</span></div>
      </div>
    </section>
  )
}
