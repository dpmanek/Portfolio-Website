import { useEffect, useState } from 'react'

interface Props {
  onNavigate: (id: string) => void
  onOpenConsole: () => void
}

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'contact', label: 'Contact' },
]

function nycTime() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function Nav({ onNavigate, onOpenConsole }: Props) {
  const [time, setTime] = useState(nycTime())

  useEffect(() => {
    const id = setInterval(() => setTime(nycTime()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav className="nav">
      <a className="logo" href="#" onClick={(e) => { e.preventDefault(); onNavigate('top') }}>
        DM<span>©26</span>
      </a>
      <div className="nav-links mono">
        {LINKS.map((l) => (
          <button key={l.id} onClick={() => onNavigate(l.id)}>
            {l.label}
          </button>
        ))}
        <button className="nav-console" onClick={onOpenConsole} data-cursor="talk">
          DEEP·OS <span>⌘K</span>
        </button>
      </div>
      <div className="clock mono">NYC {time}</div>
    </nav>
  )
}
