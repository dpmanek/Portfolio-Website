import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LINKS } from '../data'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const rootRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact h2 .word',
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.08,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.contact h2', start: 'top 82%', once: true },
        },
      )
    }, rootRef)

    // magnetic button
    const btn = btnRef.current
    if (btn && !window.matchMedia('(hover: none)').matches) {
      const strength = 0.35
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect()
        const x = e.clientX - (r.left + r.width / 2)
        const y = e.clientY - (r.top + r.height / 2)
        gsap.to(btn, { x: x * strength, y: y * strength, duration: 0.3, ease: 'power2.out' })
      }
      const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
      btn.addEventListener('mousemove', onMove)
      btn.addEventListener('mouseleave', onLeave)
      return () => {
        btn.removeEventListener('mousemove', onMove)
        btn.removeEventListener('mouseleave', onLeave)
        ctx.revert()
      }
    }
    return () => ctx.revert()
  }, [])

  return (
    <section className="section contact" id="contact" ref={rootRef}>
      <div className="avail mono">
        <span className="dot" />
        Open to FDE · AI Architect · Solutions roles
      </div>
      <h2 aria-label="Let's build what's next">
        <span className="line">
          <span className="word">Let's&nbsp;build</span>
        </span>
        <span className="line hollow">
          <span className="word">what's&nbsp;next</span>
        </span>
      </h2>
      <div className="contact-cta">
        <a className="magnetic-btn" href={`mailto:${LINKS.email}`} ref={btnRef}>
          {LINKS.email} <span>↗</span>
        </a>
      </div>
      <div className="contact-links mono">
        <a href={LINKS.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href={LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={`mailto:${LINKS.email}`}>Email</a>
      </div>
    </section>
  )
}
