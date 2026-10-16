import { ProjectCard } from '../components/ProjectCard'
import { SectionLabel } from '../components/SectionLabel'
import { projects } from '../data/projects'

export function ProjectsSection() {
  return (
    <section className="projects-section" id="projects" data-reveal aria-labelledby="projects-title">
      <header className="projects-heading">
        <SectionLabel>Projects</SectionLabel>
        <h2 id="projects-title">Things I’ve Made</h2>
      </header>

      <div className="project-grid">
        {projects.map((project) => <ProjectCard project={project} key={project.title} />)}

        <article className="project-card future-card">
          <div className="project-visual future">
            <span className="card-sparkle" aria-hidden="true">✦</span>
            <span className="project-number">04</span>
            <div className="visual-orbit" aria-hidden="true" />
          </div>
          <div className="project-info">
            <h3>More Things I’m Building</h3>
            <p>A little space for future projects—ideas currently drifting in the clouds.</p>
            <div className="project-tags"><span>Coming soon</span></div>
          </div>
        </article>
      </div>
    </section>
  )
}
