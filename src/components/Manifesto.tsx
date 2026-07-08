import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MANIFESTO, STATS } from '../data'
import Scramble from './Scramble'

gsap.registerPlugin(ScrollTrigger)

const ACCENT_WORDS = new Set(['bank', 'production.', 'embedded', 'architecture,'])

export default function Manifesto() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.manifesto .word', {
        opacity: 1,
        stagger: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto p',
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.4,
        },
      })

      gsap.utils.toArray<HTMLElement>('.stat .num').forEach((el) => {
        const target = Number(el.dataset.value ?? 0)
        const obj = { v: 0 }
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          onUpdate: () => {
            const span = el.querySelector('.val')
            if (span) span.textContent = String(Math.round(obj.v))
          },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section manifesto" ref={rootRef}>
      <div className="section-label mono">
        <span className="idx">01</span>
        <Scramble text="The Work" />
      </div>
      <p>
        {MANIFESTO.split(' ').map((w, i) => (
          <span key={i} className={`word${ACCENT_WORDS.has(w) ? ' accent' : ''}`}>
            {w}{' '}
          </span>
        ))}
      </p>
      <div className="stats">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <div className="num" data-value={s.value}>
              <span className="val">0</span>
              <span className="suffix">{s.suffix}</span>
            </div>
            <div className="lbl">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
