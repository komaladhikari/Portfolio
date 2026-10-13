import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    number: '01',
    title: 'Garage',
    description: 'A software engineering project focused on identifying bottlenecks in application request flows.',
    tags: ['Python', 'Tracing', 'Performance'],
    github: 'https://github.com/your-username/garage',
    demo: 'https://example.com/garage-demo',
    accent: 'rose',
  },
  {
    number: '02',
    title: 'Repo Doctor',
    description: 'A tool for exploring and understanding repository architecture, health, and dependencies.',
    tags: ['TypeScript', 'Static Analysis', 'Visualization'],
    github: 'https://github.com/your-username/repo-doctor',
    demo: 'https://example.com/repo-doctor-demo',
    accent: 'violet',
  },
]
