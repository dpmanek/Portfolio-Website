import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Self-drawing architecture diagram for the flagship Migration Intelligence
// Engine: connectors draw in and nodes light up as the card scrolls into view.

const NODES = [
  { x: 20, y: 30, w: 150, label: 'Enterprise Docs', sub: 'AIF · TMD · ALD' },
  { x: 220, y: 30, w: 150, label: 'Lambda Ingestion', sub: 'chunk + embed' },
  { x: 420, y: 30, w: 160, label: 'OpenSearch RAG', sub: 'vector retrieval' },
  { x: 630, y: 30, w: 150, label: 'AWS Bedrock', sub: 'contextual Q&A' },
  { x: 320, y: 130, w: 170, label: 'Schema Generator', sub: 'JSON → UI spec' },
  { x: 560, y: 130, w: 180, label: 'React Questionnaire', sub: 'rendered on the fly' },
]

const LINKS_D = [
  'M170 55 H220',
  'M370 55 H420',
  'M580 55 H630',
  'M700 80 C700 110 560 100 490 130',
  'M490 155 H560',
  'M405 130 C405 100 340 90 300 80',
]

export default function ArchDiagram() {
  const rootRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = rootRef.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      const paths = svg.querySelectorAll<SVGPathElement>('.arch-link')
      paths.forEach((p) => {
        const len = p.getTotalLength()
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = `${len}`
      })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: svg, start: 'top 85%', end: 'top 35%', scrub: 0.4 },
      })
      tl.fromTo(
        svg.querySelectorAll('.arch-node'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 },
        0,
      )
      tl.to(paths, { strokeDashoffset: 0, stagger: 0.1, duration: 0.9 }, 0.15)
    }, svg)
    return () => ctx.revert()
  }, [])

  return (
    <svg
      ref={rootRef}
      className="arch-diagram"
      viewBox="0 0 780 190"
      role="img"
      aria-label="Architecture: enterprise documents flow through Lambda ingestion into OpenSearch RAG and AWS Bedrock, generating JSON schemas rendered as a React questionnaire"
    >
      {LINKS_D.map((d, i) => (
        <path key={i} className="arch-link" d={d} />
      ))}
      {NODES.map((n) => (
        <g key={n.label} className="arch-node" transform={`translate(${n.x}, ${n.y})`}>
          <rect width={n.w} height={50} rx={8} />
          <text x={n.w / 2} y={21}>{n.label}</text>
          <text x={n.w / 2} y={38} className="sub">{n.sub}</text>
        </g>
      ))}
    </svg>
  )
}
