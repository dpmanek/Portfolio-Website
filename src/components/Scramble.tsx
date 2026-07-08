import { useEffect, useRef } from 'react'

const CHARS = '█▓▒░<>/\\|=+*#01'

interface Props {
  text: string
  className?: string
  duration?: number
}

// Decodes text left-to-right through glitch characters when scrolled into view.
export default function Scramble({ text, className, duration = 700 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current!
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text
      return
    }

    let raf = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        const settled = Math.floor(p * text.length)
        let out = text.slice(0, settled)
        for (let i = settled; i < text.length; i++) {
          out += text[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]
        }
        el.textContent = out
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [text, duration])

  // reserve final width to avoid layout shift while scrambling
  return (
    <span ref={ref} className={className} aria-label={text}>
      {text}
    </span>
  )
}
