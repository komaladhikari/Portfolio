import { SectionLabel } from '../components/SectionLabel'

export function AboutSection() {
  const skills = ['Python', 'C++', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Node.js', 'Machine Learning', 'Git']

  return (
    <section className="about-section" id="about" data-reveal aria-labelledby="about-title">
      <div className="about-photo-column">
        <div className="about-photo-frame">
          {/* Add public/about-photo.jpg and it will appear here automatically. */}
          <div className="photo-placeholder" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="22" r="10" />
              <path d="M14 56v-7c0-9 8-16 18-16s18 7 18 16v7" />
            </svg>
            <span>Add your photo</span>
            <small>public/about-photo.jpg</small>
          </div>
          <img
            className="about-photo"
            src="/about-photo.jpg"
            alt="Komal Adhikari"
            onError={(event) => { event.currentTarget.style.display = 'none' }}
          />
          <span className="photo-sparkle" aria-hidden="true">✦</span>
        </div>
      </div>

      <div className="about-content">
        <SectionLabel>About</SectionLabel>
        <h2 id="about-title">A Little About This Human</h2>
        <p className="about-intro">
          I’m a Computer Science student at Texas State University, minoring in
          Mathematics. I enjoy building thoughtful software, asking questions,
          and exploring ideas where technology meets creativity. I’m especially
          interested in artificial intelligence, trustworthy machine learning,
          research, and software engineering.
        </p>

        <div className="about-details">
          <div>
            <h3>Education</h3>
            <p>B.S. Computer Science<br />Minor in Mathematics<br />Texas State University<br />Expected May 2028</p>
          </div>
          <div>
            <h3>Curious about</h3>
            <p>Artificial Intelligence · Trustworthy Machine Learning · Research · Software Engineering · Data Visualization · Creative Writing</p>
          </div>
        </div>

        <div className="skill-list" aria-label="Technical skills">
          {skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>

        <ul className="about-notes">
          <li>I like connecting research ideas with practical implementations.</li>
          <li>I write and edit stories about education, mentorship, and community.</li>
          <li>Cloud-watching is still one of my favorite ways to reset.</li>
        </ul>

        <a className="resume-button" href="/Komal-Adhikari-Resume.pdf" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3h7l4 4v14H7z" />
            <path d="M14 3v5h5M10 13h5M10 17h5" />
          </svg>
          View Resume
        </a>
      </div>
    </section>
  )
}
