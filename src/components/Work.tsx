import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJECTS } from '../data'

gsap.registerPlugin(ScrollTrigger)

export default function Work() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card')
      // as the next card scrolls in, the pinned previous card recedes
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.to(card, {
          scale: 0.94,
          filter: 'brightness(0.45)',
          ease: 'none',
          scrollTrigger: {
            trigger: next,
            start: 'top bottom',
            end: 'top top+=120',
            scrub: true,
          },
        })
      })

      gsap.utils.toArray<HTMLElement>('.project-card').forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 92%', once: true },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" id="work" ref={rootRef}>
      <div className="section-label mono">
        <span className="idx">02</span>
        <span>Selected Work</span>
      </div>
      <p className="work-intro">
        Systems shipped inside enterprises, plus open R&D. Each one deployed, measured, and used.
      </p>
      <div className="card-stack">
        {PROJECTS.map((p) => (
          <article
            className={`project-card${p.flagship ? ' flagship' : ''}`}
            data-index={p.index}
            key={p.title}
          >
            <div className="project-head">
              {p.flagship && <span className="badge">Flagship</span>}
              <h3>{p.title}</h3>
              <div className="subtitle mono">{p.subtitle}</div>
              <p className="desc">{p.description}</p>
            </div>
            <div className="project-side">
              <div className="project-metric">
                <div className="m-val">{p.metric}</div>
                <div className="m-lbl mono">{p.metricLabel}</div>
              </div>
              <div className="tags">
                {p.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="year-row mono">
                <span>{p.year}</span>
                {p.link && (
                  <a className="repo-link" href={p.link} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
