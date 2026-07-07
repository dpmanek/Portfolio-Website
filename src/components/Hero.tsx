import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import HeroCanvas from './HeroCanvas'

interface Props {
  loaded: boolean
}

export default function Hero({ loaded }: Props) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!loaded) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
      tl.fromTo(
        '.hero-title .word',
        { yPercent: 115, rotate: 4 },
        { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.09 },
      )
      tl.fromTo(
        ['.hero-eyebrow', '.hero-tagline', '.hero-meta', '.hero-scroll'],
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
        '-=0.6',
      )
    }, rootRef)
    return () => ctx.revert()
  }, [loaded])

  return (
    <section className="hero" id="top" ref={rootRef}>
      <HeroCanvas />
      <div className="hero-content">
        <div className="hero-eyebrow mono" style={{ opacity: 0 }}>
          <span className="dot" />
          Forward Deployed AI Engineer — New York City
        </div>
        <h1 className="hero-title" aria-label="Deep Manek">
          <span className="line">
            <span className="word">Deep</span>
          </span>
          <span className="line">
            <span className="word">Manek</span>
          </span>
        </h1>
        <div className="hero-sub">
          <p className="hero-tagline" style={{ opacity: 0 }}>
            I build AI systems that <em>survive contact with the enterprise</em> — applied LLM
            platforms, agentic workflows, and the cloud infrastructure underneath them.
          </p>
          <div className="hero-meta mono" style={{ opacity: 0 }}>
            <span><strong>6+ yrs</strong> full stack · AI · DevOps</span>
            <span>Banking & enterprise delivery</span>
            <span>AWS Bedrock · Claude · RAG · CI/CD</span>
          </div>
        </div>
      </div>
      <div className="hero-scroll mono" style={{ opacity: 0 }}>scroll</div>
    </section>
  )
}
