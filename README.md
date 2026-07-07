# deepmanek.dev — Portfolio

Cinematic single-page portfolio for **Deep Manek** — Forward Deployed AI Engineer, NYC.

Dark, scroll-driven storytelling in the style of Awwwards-winning sites: a Three.js
GLSL particle field behind kinetic typography, GSAP ScrollTrigger choreography,
Lenis smooth scrolling, stacking project cards, and a scroll-scrubbed manifesto.

## Stack

- Vite + React 19 + TypeScript
- GSAP + ScrollTrigger (scroll choreography)
- Lenis (smooth scroll)
- Three.js (custom shader particle field)

## Run

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run build    # production build to dist/
```

## Deploy (Vercel)

```bash
npm i -g vercel
vercel           # from this directory — framework auto-detected as Vite
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) — zero config needed.

## Editing content

All copy lives in [`src/data.ts`](src/data.ts) — projects, experience, stats,
stack, links, and the manifesto paragraph. Edit that one file to update the site.
