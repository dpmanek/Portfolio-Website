import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { JOBS } from '../data'

gsap.registerPlugin(ScrollTrigger)

export default function Experience() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.exp-line-fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.exp-list',
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.4,
        },
      })

      gsap.utils.toArray<HTMLElement>('.exp-item').forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -32 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 85%', once: true },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" id="experience" ref={rootRef}>
      <div className="section-label mono">
        <span className="idx">03</span>
        <span>Experience</span>
      </div>
      <div className="exp-list">
        <div className="exp-line">
          <div className="exp-line-fill" />
        </div>
        {JOBS.map((job) => (
          <div className="exp-item" key={job.company}>
            <div className="exp-head">
              <h3>{job.company}</h3>
              <span className="period mono">{job.period} · {job.location}</span>
            </div>
            <div className="exp-role mono">{job.role}</div>
            <p className="exp-summary">{job.summary}</p>
            <ul className="exp-points">
              {job.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            {job.engagements && (
              <div className="engagements">
                {job.engagements.map((e) => (
                  <div className="engagement" data-hover key={e.client}>
                    <div className="client">
                      {e.client}
                      <span className="mono">{e.role}</span>
                    </div>
                    <p>{e.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
