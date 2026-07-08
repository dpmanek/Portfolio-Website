import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface Props {
  onDone: () => void
}

export default function Preloader({ onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doneRef.current()
      return
    }
    const counter = { v: 0 }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => doneRef.current(),
      })
      tl.to(counter, {
        v: 100,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (countRef.current) countRef.current.textContent = String(Math.round(counter.v))
        },
      })
      tl.to(barRef.current, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
      tl.to(rootRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        delay: 0.15,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  return (
    <div className="preloader" ref={rootRef}>
      <div className="mono boot">initializing deep·os — nyc edge</div>
      <div className="count">
        <span ref={countRef}>0</span>
        <span className="pct">%</span>
      </div>
      <div className="bar">
        <div className="bar-fill" ref={barRef} />
      </div>
    </div>
  )
}
