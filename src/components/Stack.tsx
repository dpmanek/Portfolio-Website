import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STACK_GROUPS } from '../data'

gsap.registerPlugin(ScrollTrigger)

export default function Stack() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.stack-group').forEach((group) => {
        gsap.fromTo(
          group.querySelectorAll('li'),
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.035,
            ease: 'power2.out',
            scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          },
        )
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section" id="stack" ref={rootRef}>
      <div className="section-label mono">
        <span className="idx">04</span>
        <span>Arsenal</span>
      </div>
      <div className="stack-groups">
        {STACK_GROUPS.map((g) => (
          <div className="stack-group" key={g.name}>
            <h4>{g.name}</h4>
            <ul>
              {g.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
