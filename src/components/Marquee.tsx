import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  'Applied LLM Systems',
  'Agentic Workflows',
  'RAG Architecture',
  'Forward Deployment',
  'Solution Architecture',
  'Cloud & DevOps',
  'Banking-Grade Delivery',
  'Voice AI',
]

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)
  const row = [...ITEMS, ...ITEMS]

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const tween = gsap.to(trackRef.current, {
      xPercent: -50,
      duration: 28,
      ease: 'none',
      repeat: -1,
    })

    // scroll velocity whips the marquee, then it settles back
    let boost = 0
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) / 600, 4)
      },
    })
    const tick = () => {
      const ts = tween.timeScale()
      tween.timeScale(ts + (1 + boost - ts) * 0.08)
      boost *= 0.92
    }
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      st.kill()
      tween.kill()
    }
  }, [])

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" ref={trackRef}>
        {row.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  )
}
