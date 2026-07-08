import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STACK_GROUPS } from '../data'
import Scramble from './Scramble'
import Constellation from './Constellation'

gsap.registerPlugin(ScrollTrigger)

export default function Stack() {
  const rootRef = useRef<HTMLElement>(null)
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 861,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)')
    const onChange = () => setDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (desktop) return
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
  }, [desktop])

  return (
    <section className="section" id="stack" ref={rootRef}>
      <div className="section-label mono">
        <span className="idx">04</span>
        <Scramble text="Arsenal — Knowledge Graph" />
      </div>
      {desktop ? (
        <>
          <p className="stack-hint mono">drag nodes · hover to isolate a domain</p>
          <Constellation />
        </>
      ) : (
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
      )}
    </section>
  )
}
