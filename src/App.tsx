import { useEffect, useState } from 'react'

type Wish = { text: string; anonymous: boolean; granted: boolean }

const projects = [
  { number: '01', title: 'Garage', type: 'Software engineering', description: 'A closer look at the bottlenecks hiding inside application request flows.', tags: ['Python', 'Systems'], accent: 'butter' },
  { number: '02', title: 'Repo Doctor', type: 'Developer tooling', description: 'A small companion for exploring and understanding repository architecture.', tags: ['TypeScript', 'CLI'], accent: 'rose' },
  { number: '03', title: 'More things soon', type: 'The next chapter', description: 'A quiet placeholder for the experiments, sketches, and useful things still taking shape.', tags: ['Curiosity', 'In progress'], accent: 'lilac' },
]

const writing = [
  { date: 'A note from 2025', title: 'On making room for better questions', excerpt: 'A little reflection on learning in public, following threads, and staying curious.' },
  { date: 'A note from 2025', title: 'The gentle art of beginning again', excerpt: 'Thoughts from the space between an idea and the first imperfect version.' },
]

const wishes = [
  'I hope I find a place where I belong.',
  'A little more wonder in ordinary days.',
  'For the courage to keep making things.',
  'I wish for soft landings and good questions.',
]

function Star({ className = '' }: { className?: string }) { return <span className={`star ${className}`} aria-hidden="true">✦</span> }
function Arrow() { return <span aria-hidden="true">↗</span> }

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(() => !sessionStorage.getItem('sky-welcome-seen'))
  const [wish, setWish] = useState<Wish | null>(() => { try { return JSON.parse(localStorage.getItem('sky-wish') || 'null') } catch { return null } })
  const [wishText, setWishText] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [activeWish, setActiveWish] = useState<string | null>(null)
  const [granted, setGranted] = useState(false)

  useEffect(() => { document.body.classList.toggle('modal-open', modalOpen) }, [modalOpen])
  useEffect(() => { if (wish) localStorage.setItem('sky-wish', JSON.stringify(wish)) }, [wish])

  const closeModal = () => { sessionStorage.setItem('sky-welcome-seen', 'true'); setModalOpen(false) }
  const leaveWish = () => { if (!wishText.trim()) return; setWish({ text: wishText.trim(), anonymous, granted: false }); setSubmitted(true) }
  const catchStar = () => { if (!wish) return; setWish({ ...wish, granted: true }); setGranted(true) }

  return <div className="site-shell">
    <div className="grain" aria-hidden="true" />
    <header className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <a href="#home" className="wordmark">Komal <Star /></a>
        <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {['about', 'projects', 'research', 'writing', 'sky', 'contact'].map(item => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)}>{item[0].toUpperCase() + item.slice(1)}</a>)}
          <button className="nav-wish" onClick={() => setModalOpen(true)}>Leave a wish <Star /></button>
        </div>
      </nav>
    </header>

    <main>
      <section id="home" className="hero section-light">
        <div className="hero-sun" aria-hidden="true" />
        <div className="constellation c-one"><i /><i /><i /><i /></div>
        <div className="constellation c-two"><i /><i /><i /></div>
        <div className="shooting-star" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow">Computer science · research · creative work</p>
          <h1>Hi, I'm Komal.<br /><em>Somewhere</em> between code<br />and everything in between.</h1>
          <p className="hero-copy">A curious mind building useful things, asking better questions, and keeping a little room for wonder.</p>
          <div className="hero-actions"><a className="button button-dark" href="#projects">Explore my work <Arrow /></a><a className="text-link" href="#about">A little about me <span>↓</span></a></div>
        </div>
        <div className="scroll-note"><span className="scroll-line" /> Scroll to wander</div>
        <div className="cloud cloud-left" aria-hidden="true" /><div className="cloud cloud-right" aria-hidden="true" />
      </section>

      <section id="about" className="about section-cream section-pad">
        <div className="section-label"><span>01</span><span className="label-line" /><span>A little about this human</span></div>
        <div className="about-grid">
          <div className="portrait-wrap"><div className="portrait"><span>your photo<br />goes here</span><span className="portrait-corner">✦</span></div><p className="portrait-caption">Based in Texas · usually curious</p></div>
          <div className="about-copy"><h2>Soft heart.<br /><em>Sharp questions.</em></h2><p>I'm a Computer Science student at Texas State University, minoring in Applied Mathematics. I enjoy building things, asking questions, and exploring ideas that connect technology with creativity.</p><p>My interests tend to orbit around artificial intelligence, machine learning, research, and software engineering. Outside of code, you'll find me writing, noticing small details, or collecting questions for later.</p><div className="about-bottom"><a className="button button-outline" href="#contact">Say hello <Arrow /></a><div><span className="mini-label">Currently learning</span><div className="tags"><span>Python</span><span>TypeScript</span><span>Machine learning</span><span>Applied math</span></div></div></div></div>
        </div>
      </section>

      <section id="projects" className="projects section-lilac section-pad">
        <div className="section-label"><span>02</span><span className="label-line" /><span>Things I've made</span></div>
        <div className="section-heading-row"><h2>A few things<br /><em>taking shape.</em></h2><p>Projects are where ideas get their hands dirty. These are a few places I've been lately.</p></div>
        <div className="project-grid">{projects.map(project => <article className={`project-card ${project.accent}`} key={project.title}><div className="project-thumb"><span>{project.number}</span><div className="thumb-mark">{project.number === '01' ? '⌁' : project.number === '02' ? '⌘' : '✳'}</div></div><div className="project-meta"><span>{project.type}</span><span>↗</span></div><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div>
      </section>

      <section id="research" className="research section-cream section-pad"><div className="section-label"><span>03</span><span className="label-line" /><span>Things I'm curious about</span></div><div className="research-layout"><div><h2>Looking closer<br />at <em>the world.</em></h2><p className="research-intro">The best research starts as a small, persistent question. I'm interested in the ways computation can help us notice what we usually miss.</p></div><article className="research-card"><div className="research-top"><span className="status-dot" /> Research in progress <span className="research-index">01 / 03</span></div><h3>Camera-Based<br /><em>Visibility Estimation</em></h3><p>Exploring how computer vision and machine learning can estimate atmospheric visibility from images.</p><div className="method-list"><span>Computer vision</span><span>Machine learning</span><span>Image analysis</span></div><button className="card-link">Read more <Arrow /></button></article></div></section>

      <section id="writing" className="writing section-peach section-pad"><div className="section-label"><span>04</span><span className="label-line" /><span>Little pieces of my mind</span></div><div className="writing-heading"><h2>Notes from<br /><em>the in-between.</em></h2><a className="text-link" href="#writing">Find me on Substack <Arrow /></a></div><div className="writing-grid">{writing.map((post, index) => <article className="writing-card" key={post.title}><span className="post-number">0{index + 1}</span><span className="post-date">{post.date}</span><h3>{post.title}</h3><p>{post.excerpt}</p><a href="#writing" className="read-link">Read the note <Arrow /></a></article>)}</div></section>

      <section id="sky" className="shared-sky section-pad"><div className="sky-stars" aria-hidden="true">{Array.from({ length: 22 }, (_, i) => <span key={i} style={{ '--x': `${(i * 37) % 96}%`, '--y': `${(i * 53) % 88}%`, '--delay': `${(i % 5) * .6}s` } as React.CSSProperties}>{i % 7 === 0 ? '✦' : '·'}</span>)}</div><div className="section-label light"><span>05</span><span className="label-line" /><span>Somewhere, a star</span></div><div className="sky-heading"><p className="eyebrow light-text">A small corner of the internet</p><h2>The Shared<br /><em>Sky</em></h2><p>Every bright star holds a wish.</p></div><div className="wish-field">{wishes.map((item, i) => <button className={`wish-star ws-${i}`} key={item} onClick={() => setActiveWish(item)} aria-label={`View wish ${i + 1}`}><Star /></button>)}{wish?.granted && <button className="wish-star your-wish" onClick={() => setActiveWish(wish.anonymous ? 'Someone wished for something beautiful here.' : wish.text)} aria-label="View your granted wish"><Star /></button>}</div><div className="sky-footer"><span>Somewhere in the world, someone wished for something.</span><button className="sky-list" onClick={() => setActiveWish(wishes[0])}>Browse the wishes <Arrow /></button></div></section>

      <section id="contact" className="contact section-cream section-pad"><div className="section-label"><span>06</span><span className="label-line" /><span>Send something my way</span></div><div className="contact-layout"><div><h2>Let's make<br /><em>something good.</em></h2><p>Have an idea, a question, or just want to say hello? I'd love to hear from you.</p></div><div className="contact-links"><a href="mailto:hello@komaladhikari.dev"><span>Email</span><strong>hello@komaladhikari.dev <Arrow /></strong></a><a href="#contact"><span>Elsewhere</span><strong>GitHub · LinkedIn <Arrow /></strong></a><a href="#contact"><span>For your desk</span><strong>Download my resume <Arrow /></strong></a></div></div></section>
    </main>

    <footer><span>Made with curiosity, a little code, and a sky full of wishes. <Star /></span><span>© 2025 Komal Adhikari</span></footer>

    {modalOpen && <div className="modal-backdrop"><div className="wish-modal" role="dialog" aria-modal="true" aria-labelledby="wish-title"><button className="modal-close" onClick={closeModal} aria-label="Close wish window">×</button>{submitted ? <div className="modal-success"><Star className="big-star" /><p className="eyebrow">A note for the sky</p><h2 id="wish-title">The sky<br /><em>has heard you.</em></h2><p>Now go explore. Your star might find you along the way.</p><button className="button button-dark" onClick={closeModal}>Go wander <Arrow /></button></div> : <><div className="modal-stars">✦　·　✧</div><p className="eyebrow">A little invitation</p><h2 id="wish-title">We share<br /><em>the same sky.</em></h2><p>Somewhere, shooting stars are passing by. Leave a little wish here, so when one finds you, it knows what to grant.</p><textarea value={wishText} onChange={e => setWishText(e.target.value)} placeholder="I wish..." aria-label="Your wish" /><label className="check-row"><input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} /> <span>Let others read my wish anonymously</span></label><button className="button button-dark full" onClick={leaveWish}>Leave a wish <Star /></button><button className="maybe" onClick={closeModal}>Maybe later</button></>}</div></div>}
    {activeWish && <div className="wish-popover" role="dialog"><button onClick={() => setActiveWish(null)} aria-label="Close wish">×</button><Star className="popover-star" /><p>“{activeWish}”</p><span>from somewhere in the shared sky</span></div>}
    {wish && !wish.granted && <button className="catch-me" onClick={catchStar}><span className="catch-dot" /> Your shooting star is nearby <Arrow /></button>}
    {granted && <div className="grant-toast"><Star /><div><strong>Granted.</strong><span>Your wish found its place among the stars.</span></div><button onClick={() => setGranted(false)} aria-label="Dismiss">×</button></div>}
  </div>
}

export default App
