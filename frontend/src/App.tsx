import { useEffect, useMemo, useState } from 'react'

type Wish = { id: number; text: string; x: number; y: number }

const seedWishes: Wish[] = [
  { id: 1, text: 'to find the place that feels like home', x: 17, y: 31 },
  { id: 2, text: 'for one more summer together', x: 68, y: 23 },
  { id: 3, text: 'to be brave enough to begin', x: 79, y: 58 },
  { id: 4, text: 'that mom gets better soon', x: 35, y: 69 },
  { id: 5, text: 'to make something that lasts', x: 56, y: 48 },
]

const stars = Array.from({ length: 76 }, (_, i) => ({
  x: (i * 47 + 11) % 100,
  y: (i * 67 + 7) % 88,
  size: i % 13 === 0 ? 2.2 : i % 5 === 0 ? 1.4 : 0.8,
  delay: (i % 12) * 0.37,
}))

function App() {
  const [shooting, setShooting] = useState(false)
  const [caught, setCaught] = useState(false)
  const [wish, setWish] = useState('')
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('shared-sky-wishes')
    return saved ? [...seedWishes, ...JSON.parse(saved)] : seedWishes
  })

  const sharedCount = 12847 + Math.max(0, wishes.length - seedWishes.length)
  const starStyle = useMemo(() => ({
    left: `${18 + Math.random() * 54}%`,
    top: `${15 + Math.random() * 34}%`,
    transform: `rotate(${8 + Math.random() * 12}deg)`,
  }), [shooting])

  useEffect(() => {
    let hideTimer: number
    const showTimer = window.setTimeout(() => {
      setShooting(true)
      hideTimer = window.setTimeout(() => setShooting(false), 5200)
    }, 2400)
    return () => { window.clearTimeout(showTimer); window.clearTimeout(hideTimer) }
  }, [])

  useEffect(() => {
    if (shooting || caught) return
    const timer = window.setTimeout(() => setShooting(true), 7000 + Math.random() * 6000)
    return () => window.clearTimeout(timer)
  }, [shooting, caught])

  const catchStar = () => { setShooting(false); setCaught(true) }

  const releaseWish = () => {
    const text = wish.trim()
    if (!text) return
    const newWish: Wish = { id: Date.now(), text, x: 22 + Math.random() * 56, y: 20 + Math.random() * 54 }
    const personalWishes = [...wishes.filter(w => w.id > 10), newWish]
    localStorage.setItem('shared-sky-wishes', JSON.stringify(personalWishes))
    setWishes([...wishes, newWish])
    setSelectedWish(newWish)
    setWish('')
    setCaught(false)
  }

  return (
    <main className="sky-shell">
      <div className="aurora" />
      <div className="stars" aria-hidden="true">
        {stars.map((star, i) => <i key={i} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, animationDelay: `${star.delay}s` }} />)}
      </div>

      <nav>
        <a className="brand" href="#top"><span>✦</span> Shared Sky</a>
        <div className="nav-links"><a href="#how">How it works</a><a href="#wishes">Explore wishes</a></div>
        <button className="sound" aria-label="Sound ambience unavailable">◖))</button>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span className="pulse" /> The sky is listening</div>
        <h1>Somewhere,<br />a star is <em>falling.</em></h1>
        <p className="intro">Catch it before it disappears. Make a wish.<br />Leave a little light in the sky for someone else to find.</p>
        <div className="waiting"><span className="orb">✦</span><span><b>Wait for it...</b><small>A shooting star appears when you least expect it.</small></span></div>
        <span className="scroll-note">Keep your eyes on the sky <b>↓</b></span>
      </section>

      {shooting && !caught && (
        <button className="shooting-star" style={starStyle} onClick={catchStar} aria-label="Catch the shooting star">
          <span /> <b>catch me</b>
        </button>
      )}

      <section className="how" id="how">
        <span className="section-number">01 — The ritual</span>
        <h2>One fleeting moment.<br /><i>One honest wish.</i></h2>
        <div className="steps">
          <article><span className="step-icon">⌁</span><b>01</b><h3>Watch</h3><p>Stay still. Shooting stars arrive without warning and vanish in a breath.</p></article>
          <article><span className="step-icon">✦</span><b>02</b><h3>Catch</h3><p>Tap the star while it crosses your sky. You only get one chance.</p></article>
          <article><span className="step-icon">◌</span><b>03</b><h3>Wish</h3><p>Write what you carry quietly. Release it into the shared night.</p></article>
        </div>
      </section>

      <section className="wish-field" id="wishes">
        <div className="wish-copy"><span className="section-number">02 — The constellation</span><h2>A sky made of<br /><i>everyone’s hope.</i></h2><p>{sharedCount.toLocaleString()} wishes are glowing here tonight. Touch a star to hear what someone, somewhere, is hoping for.</p></div>
        <div className="constellation">
          {wishes.map((item, index) => (
            <button key={item.id} className={`wish-star ${item.id > 10 ? 'mine' : ''}`} style={{ left: `${item.x}%`, top: `${item.y}%`, animationDelay: `${index * .4}s` }} onClick={() => setSelectedWish(item)} aria-label="Read this wish">✦</button>
          ))}
          {selectedWish && <div className="wish-note"><button onClick={() => setSelectedWish(null)}>×</button><span>someone wished</span><p>“{selectedWish.text}”</p></div>}
          <div className="orbit one" /><div className="orbit two" />
        </div>
      </section>

      <footer><span>© Tonight, wherever you are</span><span className="footer-mark">✦</span><span>We all look up at the same sky.</span></footer>

      {caught && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="wish-title">
          <div className="wish-modal">
            <button className="close" onClick={() => setCaught(false)}>×</button>
            <span className="caught-star">✦</span><small>You caught it</small>
            <h2 id="wish-title">What do you<br /><i>wish for?</i></h2>
            <textarea autoFocus maxLength={120} value={wish} onChange={e => setWish(e.target.value)} placeholder="Write it softly..." />
            <div className="wish-actions"><span>{wish.length} / 120</span><button onClick={releaseWish} disabled={!wish.trim()}>Release into the sky <b>↗</b></button></div>
            <p>Your wish is anonymous. Just a small light among thousands.</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
