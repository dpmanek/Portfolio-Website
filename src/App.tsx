import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Manifesto from './components/Manifesto'
import Work from './components/Work'
import Experience from './components/Experience'
import Stack from './components/Stack'
import Contact from './components/Contact'
import { LINKS } from './data'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    ScrollTrigger.refresh()
    // late refresh catches restored-scroll positions and late font/layout shifts
    const t = setTimeout(() => ScrollTrigger.refresh(), 1200)
    return () => clearTimeout(t)
  }, [loaded])

  const navigate = (id: string) => {
    const target = id === 'top' ? 0 : `#${id}`
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target as never, { offset: id === 'top' ? 0 : -40 })
    } else {
      if (id === 'top') window.scrollTo({ top: 0 })
      else document.getElementById(id)?.scrollIntoView()
    }
  }

  return (
    <>
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <Nav onNavigate={navigate} />
      <main>
        <Hero loaded={loaded} />
        <Marquee />
        <Manifesto />
        <Work />
        <Experience />
        <Stack />
        <Contact />
      </main>
      <footer className="footer mono">
        <span>© 2026 Deep Manek — New York City</span>
        <span className="fable">designed & built by Deep Manek</span>
        <a href={LINKS.github} target="_blank" rel="noreferrer">
          github/dpmanek
        </a>
      </footer>
    </>
  )
}
