import { useEffect, useRef, useState } from 'react'
import { STACK_GROUPS } from '../data'

// Interactive knowledge graph of the stack — a working miniature of what
// Graphify does. Tiny custom force sim: springs on edges, pair repulsion,
// weak centering. No physics dependency needed at this node count.

interface Node {
  id: string
  label: string
  kind: 'center' | 'hub' | 'item'
  group: number
  x: number
  y: number
  vx: number
  vy: number
  pinned: boolean
}

interface EdgeDef {
  a: number
  b: number
  rest: number
}

const W = 960
const H = 640

// compound entries ("Vector DBs · FAISS / Pinecone") collide at graph scale —
// display the head term only; the full list stays in the mobile pills & agent
const shortLabel = (item: string) => item.split('·')[0].trim()

function buildGraph(): { nodes: Node[]; edges: EdgeDef[] } {
  const nodes: Node[] = []
  const edges: EdgeDef[] = []
  const cx = W / 2
  const cy = H / 2

  nodes.push({ id: 'center', label: 'DEEP·OS', kind: 'center', group: -1, x: cx, y: cy, vx: 0, vy: 0, pinned: false })

  STACK_GROUPS.forEach((g, gi) => {
    const angle = (gi / STACK_GROUPS.length) * Math.PI * 2 - Math.PI / 2
    const hx = cx + Math.cos(angle) * 195
    const hy = cy + Math.sin(angle) * 150
    const hubIndex = nodes.length
    nodes.push({ id: g.name, label: g.name, kind: 'hub', group: gi, x: hx, y: hy, vx: 0, vy: 0, pinned: false })
    edges.push({ a: 0, b: hubIndex, rest: 195 })

    g.items.forEach((item, ii) => {
      const ia = angle + ((ii / g.items.length) - 0.5) * 1.9
      nodes.push({
        id: `${g.name}/${item}`,
        label: shortLabel(item),
        kind: 'item',
        group: gi,
        x: hx + Math.cos(ia) * 105 + (Math.random() - 0.5) * 24,
        y: hy + Math.sin(ia) * 105 + (Math.random() - 0.5) * 24,
        vx: 0,
        vy: 0,
        pinned: false,
      })
      edges.push({ a: hubIndex, b: nodes.length - 1, rest: 108 })
    })
  })

  return { nodes, edges }
}

function step(nodes: Node[], edges: EdgeDef[]) {
  // springs
  for (const e of edges) {
    const a = nodes[e.a]
    const b = nodes[e.b]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.max(Math.hypot(dx, dy), 1)
    const f = (d - e.rest) * 0.012
    const fx = (dx / d) * f
    const fy = (dy / d) * f
    if (!a.pinned) { a.vx += fx; a.vy += fy }
    if (!b.pinned) { b.vx -= fx; b.vy -= fy }
  }
  // pair repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d2 = Math.max(dx * dx + dy * dy, 40)
      if (d2 > 36000) continue
      const f = 560 / d2
      const d = Math.sqrt(d2)
      const fx = (dx / d) * f
      const fy = (dy / d) * f
      if (!a.pinned) { a.vx -= fx; a.vy -= fy }
      if (!b.pinned) { b.vx += fx; b.vy += fy }
    }
  }
  // centering + integrate
  for (const n of nodes) {
    if (n.pinned) continue
    n.vx += (W / 2 - n.x) * 0.0009
    n.vy += (H / 2 - n.y) * 0.0012
    n.vx *= 0.86
    n.vy *= 0.86
    n.x = Math.min(Math.max(n.x + n.vx, 30), W - 30)
    n.y = Math.min(Math.max(n.y + n.vy, 22), H - 22)
  }
}

export default function Constellation() {
  const svgRef = useRef<SVGSVGElement>(null)
  const graphRef = useRef(buildGraph())
  const [, force] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const dragRef = useRef<number | null>(null)

  useEffect(() => {
    const { nodes, edges } = graphRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      for (let i = 0; i < 320; i++) step(nodes, edges)
      force((x) => x + 1)
      return
    }

    let raf = 0
    let running = false
    const loop = () => {
      step(nodes, edges)
      force((x) => x + 1)
      if (running) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting
        if (visible && !running) {
          running = true
          raf = requestAnimationFrame(loop)
        } else if (!visible && running) {
          running = false
          cancelAnimationFrame(raf)
        }
      },
      { threshold: 0.05 },
    )
    io.observe(svgRef.current!)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  const toSvgPoint = (e: React.PointerEvent) => {
    const svg = svgRef.current!
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return
    const n = graphRef.current.nodes[dragRef.current]
    const p = toSvgPoint(e)
    n.x = p.x
    n.y = p.y
    n.vx = 0
    n.vy = 0
    force((x) => x + 1)
  }

  const endDrag = () => {
    if (dragRef.current !== null) {
      graphRef.current.nodes[dragRef.current].pinned = false
      dragRef.current = null
    }
  }

  const { nodes, edges } = graphRef.current
  const hoverGroup = hover !== null ? nodes[hover].group : null

  const dimmed = (n: Node) =>
    hover !== null && hoverGroup !== -1 && n.group !== hoverGroup && n.kind !== 'center'

  return (
    <svg
      ref={svgRef}
      className="constellation"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Interactive knowledge graph of Deep Manek's technology stack"
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      {edges.map((e, i) => {
        const a = nodes[e.a]
        const b = nodes[e.b]
        const dim = dimmed(a) || dimmed(b)
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={`c-edge${dim ? ' dim' : ''}${a.kind === 'center' ? ' spine' : ''}`}
          />
        )
      })}
      {nodes.map((n, i) => (
        <g
          key={n.id}
          className={`c-node ${n.kind}${dimmed(n) ? ' dim' : ''}`}
          transform={`translate(${n.x}, ${n.y})`}
          data-cursor={n.kind === 'center' ? 'talk' : 'drag'}
          onClick={() => {
            if (n.kind === 'center') window.dispatchEvent(new CustomEvent('deepos:open'))
          }}
          onPointerDown={(e) => {
            if (n.kind === 'center') return
            dragRef.current = i
            n.pinned = true
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
          }}
          onPointerEnter={() => setHover(i)}
          onPointerLeave={() => setHover(null)}
        >
          <circle r={n.kind === 'center' ? 11 : n.kind === 'hub' ? 6 : 3.2} />
          <text y={n.kind === 'center' ? -20 : n.kind === 'hub' ? -16 : -9}>{n.label}</text>
          {n.kind === 'center' && <text y={26} className="c-ask">ask me ↗</text>}
        </g>
      ))}
    </svg>
  )
}
