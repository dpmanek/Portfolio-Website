import { useEffect, useState } from 'react'

interface Props {
  onOpenConsole: () => void
}

declare const __APP_VERSION__: string

function useFps(): number {
  const [fps, setFps] = useState(60)
  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      frames++
      if (now - last >= 1000) {
        setFps(Math.min(Math.round((frames * 1000) / (now - last)), 120))
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return fps
}

function useSessionClock(): string {
  const [t, setT] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const m = String(Math.floor(t / 60)).padStart(2, '0')
  const s = String(t % 60).padStart(2, '0')
  return `${m}:${s}`
}

function useLastCommit(): string | null {
  const [ago, setAgo] = useState<string | null>(null)
  useEffect(() => {
    const cached = sessionStorage.getItem('hud-commit')
    if (cached) {
      setAgo(cached)
      return
    }
    fetch('https://api.github.com/repos/dpmanek/Portfolio-Website/commits?per_page=1')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const date = new Date(data[0]?.commit?.author?.date)
        const hours = Math.max(Math.round((Date.now() - date.getTime()) / 3600000), 0)
        const label = hours < 1 ? 'deployed <1h ago' : hours < 48 ? `deployed ${hours}h ago` : `deployed ${Math.round(hours / 24)}d ago`
        sessionStorage.setItem('hud-commit', label)
        setAgo(label)
      })
      .catch(() => setAgo(null))
  }, [])
  return ago
}

export default function Hud({ onOpenConsole }: Props) {
  const fps = useFps()
  const clock = useSessionClock()
  const commit = useLastCommit()
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone?.split('/').pop()?.replace('_', ' ')

  return (
    <div className="hud mono" aria-hidden="false">
      <button className="hud-console" onClick={onOpenConsole} data-cursor="talk">
        DEEP·OS v{__APP_VERSION__} <span className="hud-key">⌘K</span>
      </button>
      <span className="hud-item hud-wide">{fps} fps</span>
      <span className="hud-item">session {clock}</span>
      {zone && <span className="hud-item hud-wide">edge · {zone.toLowerCase()}</span>}
      {commit && <span className="hud-item hud-wide">{commit}</span>}
      <span className="hud-status">
        <span className="dot" /> operational
      </span>
    </div>
  )
}
