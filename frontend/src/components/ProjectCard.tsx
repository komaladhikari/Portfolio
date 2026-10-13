import type { Project } from '../types/content'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className={`project-visual ${project.accent}`}>
        <span className="card-sparkle" aria-hidden="true">✦</span>
        <span className="project-number">{project.number}</span>
        <div className="visual-orbit" aria-hidden="true" />
      </div>

      <div className="project-info">
        <h3>{project.title}</h3>
        <p>{project.description}</p>

        <div className="project-tags">
          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>

        <div className="project-links">
          <a href={project.github} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 19c-4 1.2-4-2-5-2.5M14 22v-3.1c0-.9.3-1.5.8-1.9 2.6-.3 5.2-1.3 5.2-5.8 0-1.3-.5-2.3-1.2-3.1.1-.3.5-1.5-.1-3.1 0 0-1-.3-3.2 1.2a11.1 11.1 0 0 0-5.8 0C7.5 4.7 6.5 5 6.5 5c-.6 1.6-.2 2.8-.1 3.1A4.5 4.5 0 0 0 5.2 11c0 4.5 2.6 5.5 5.2 5.8.4.4.7 1.1.7 2.1V22" />
            </svg>
            GitHub
          </a>
          <a href={project.demo} target="_blank" rel="noreferrer">
            Live Demo <span>↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}
