import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const dot = dotRef.current!
    const ring = ringRef.current!
    const label = labelRef.current!
    let mx = -100
    let my = -100
    let rx = -100
    let ry = -100
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
    }

    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      const labeled = t.closest('[data-cursor]') as HTMLElement | null
      const hot = t.closest('a, button, [data-hover]')
      if (labeled) {
        label.textContent = labeled.dataset.cursor ?? ''
        ring.classList.add('has-label')
        ring.classList.remove('is-hover')
      } else {
        ring.classList.remove('has-label')
        ring.classList.toggle('is-hover', !!hot)
      }
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="cursor-ring" ref={ringRef}>
        <span className="cursor-label mono" ref={labelRef} />
      </div>
      <div className="cursor-dot" ref={dotRef} />
    </>
  )
}
