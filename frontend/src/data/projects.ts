import type { Project } from '../types/content'

export const projects: Project[] = [
  {
    number: '01',
    title: 'DAYate',
    description: 'A full-stack date-planning app for creating, sharing, and discussing plans, with photos and a date calendar.',
    tags: ['React', 'Node.js', 'MongoDB'],
    github: 'https://github.com/komaladhikari/DAYate',
    demo: 'https://da-yate-livid.vercel.app',
    accent: 'rose',
  },
  {
    number: '02',
    title: 'Garage',
    description: 'A software engineering project focused on identifying bottlenecks in application request flows.',
    tags: ['Python', 'Tracing', 'Performance'],
    github: 'https://github.com/your-username/garage',
    demo: 'https://example.com/garage-demo',
    accent: 'rose',
  },
  {
    number: '03',
    title: 'Repo Doctor',
    description: 'A tool for exploring and understanding repository architecture, health, and dependencies.',
    tags: ['TypeScript', 'Static Analysis', 'Visualization'],
    github: 'https://github.com/your-username/repo-doctor',
    demo: 'https://example.com/repo-doctor-demo',
    accent: 'violet',
  },
]
