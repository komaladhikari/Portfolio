import { SectionLabel } from '../components/SectionLabel'
import { SUBSTACK_URL } from '../data/writing'

export function ContactSection() {
  return (
    <section className="content-page contact-page" data-reveal aria-labelledby="contact-title">
      <SectionLabel>Contact</SectionLabel>
      <h1 id="contact-title">Let’s Make Something Thoughtful</h1>
      <p className="page-lede">I’m always happy to talk about research, software, writing, or an idea that is still taking shape.</p>
      <div className="contact-links">
        <a href="mailto:komaladhikari373@gmail.com">Email me <span>↗</span></a>
        <a href={SUBSTACK_URL} target="_blank" rel="noreferrer">Read my Substack <span>↗</span></a>
        <a href="/Komal-Adhikari-Resume.pdf" target="_blank" rel="noreferrer">View my resume <span>↗</span></a>
      </div>
    </section>
  )
}
