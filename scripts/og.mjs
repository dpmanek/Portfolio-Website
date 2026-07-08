// Generates public/og.png (1200x630) for link unfurls.
// Run: node scripts/og.mjs
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const here = dirname(fileURLToPath(import.meta.url))

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0b"/>

  <!-- faint grid dots -->
  ${Array.from({ length: 14 }, (_, r) =>
    Array.from({ length: 26 }, (_, c) => {
      const x = 40 + c * 45
      const y = 40 + r * 42
      return `<circle cx="${x}" cy="${y}" r="1.1" fill="#2a2a2c"/>`
    }).join(''),
  ).join('')}

  <!-- acid wave hint -->
  <path d="M0 480 C 200 430, 350 520, 600 470 S 1000 430, 1200 480" stroke="#d9ff3f" stroke-opacity="0.35" stroke-width="2" fill="none"/>
  <path d="M0 510 C 220 460, 380 550, 620 500 S 1020 460, 1200 510" stroke="#d9ff3f" stroke-opacity="0.15" stroke-width="2" fill="none"/>

  <circle cx="86" cy="120" r="7" fill="#d9ff3f"/>
  <text x="108" y="127" font-family="Menlo, monospace" font-size="21" letter-spacing="4" fill="#8a8a88">FORWARD DEPLOYED AI ENGINEER — NYC</text>

  <text x="80" y="290" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="150" letter-spacing="-4" fill="#ececea">DEEP</text>
  <text x="80" y="430" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="150" letter-spacing="-4" fill="none" stroke="#ececea" stroke-width="2.5">MANEK</text>

  <text x="82" y="500" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#8a8a88">AI systems that survive contact with the enterprise.</text>

  <line x1="80" y1="555" x2="1120" y2="555" stroke="#2a2a2c" stroke-width="1"/>
  <text x="80" y="590" font-family="Menlo, monospace" font-size="17" letter-spacing="2" fill="#8a8a88">DEEP·OS v2.6 · AWS BEDROCK · CLAUDE · RAG · CI/CD</text>
  <text x="1120" y="590" text-anchor="end" font-family="Menlo, monospace" font-size="17" letter-spacing="2" fill="#d9ff3f">SYSTEM: OPERATIONAL</text>
</svg>
`

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
})
const png = resvg.render().asPng()
writeFileSync(join(here, '../public/og.png'), png)
console.log(`wrote public/og.png (${(png.length / 1024).toFixed(0)} kB)`)
