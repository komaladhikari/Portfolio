import { SectionLabel } from '../components/SectionLabel'

const wishJourney = [
  {
    number: '01',
    title: 'A wish is written',
    description: 'The browser trims the message, limits it to 200 characters, and sends its public or private visibility.',
    detail: 'React → POST /api/wishes',
  },
  {
    number: '02',
    title: 'The API checks it',
    description: 'FastAPI validates the request and rate-limits submissions before anything reaches storage.',
    detail: 'Pydantic validation + rate limiting',
  },
  {
    number: '03',
    title: 'The wish finds a home',
    description: 'The database stores the wish with a unique ID, visibility, status, and stable sky coordinates.',
    detail: 'SQLAlchemy → wishes table',
  },
  {
    number: '04',
    title: 'A private key returns',
    description: 'Only a hash of the claim token is stored. The browser keeps the original key so its owner can grant or delete the wish.',
    detail: 'SHA-256 hash + local storage',
  },
  {
    number: '05',
    title: 'The star is granted',
    description: 'Catching the shooting star authenticates that key and changes the wish from pending to granted.',
    detail: 'POST /api/wishes/:id/grant',
  },
  {
    number: '06',
    title: 'The sky lights up',
    description: 'The sky requests granted wishes, protects private text, and places each one at its saved coordinates.',
    detail: 'GET /api/sky → React',
  },
]

export function BeneathSkySection() {
  return (
    <section className="content-page beneath-sky-page" data-reveal aria-labelledby="beneath-sky-title">
      <a className="beneath-sky-back" href="#/shared-sky">← Back to the Shared Sky</a>
      <SectionLabel>Beneath the Sky</SectionLabel>
      <h1 id="beneath-sky-title">How a Wish Becomes a Star</h1>
      <p className="page-lede">
        The Shared Sky is more than an animation. It is a small full-stack system that carries a thought from the browser to the database and back into the sky.
      </p>

      <ol className="wish-journey-list">
        {wishJourney.map((step) => (
          <li key={step.number}>
            <span className="wish-journey-number">{step.number}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.description}</p>
              <code>{step.detail}</code>
            </div>
          </li>
        ))}
      </ol>

      <aside className="wish-journey-privacy">
        <span aria-hidden="true">◌</span>
        <div>
          <h2>Privacy stays part of the journey</h2>
          <p>Private wishes still become stars, but their words never appear in the public sky. The API replaces them with a gentle anonymous message.</p>
        </div>
      </aside>
    </section>
  )
}
