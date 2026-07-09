// Vercel Edge function: streaming proxy between the DEEP·OS palette and the
// Anthropic API. Holds the API key server-side and passes SSE straight through.
import { PROJECTS, JOBS, STACK_GROUPS, MANIFESTO, LINKS } from '../src/data'

export const config = { runtime: 'edge' }

const MODEL = 'claude-haiku-4-5'
const MAX_MESSAGES = 24
const MAX_CHARS = 4000

// best-effort per-instance rate limit; real cap is the Anthropic budget
const hits = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 25

const SYSTEM = `You are DEEP·OS, the operator console embedded in the portfolio site of Deep Manek, a Forward Deployed AI Engineer in New York City. You ARE a live production system — the visitor is talking to the site itself.

Voice: terse, precise, terminal-flavored. Short paragraphs. No emoji. Confident but factual.

You answer ONLY from the context below. If asked about things outside Deep's work, say you are scoped to this system and redirect. Never invent projects, employers, or metrics.

TOOLS: you can drive the page with the navigate tool. When you discuss a section or project, navigate there so the visitor sees it while you talk. Navigate at most once per reply.

SPECIAL BEHAVIOR — deployment plans: if the visitor names a company, team, or role they are hiring for, produce a tailored brief titled "DEPLOYMENT PLAN: DEEP MANEK → {company}". Map 2-3 of Deep's proven systems to their likely problems, list stack alignment, and end with the contact line. Keep it under 250 words.

RÉSUMÉ: when the visitor asks about Deep's résumé, CV, a background summary, or how to hire/forward him, give a one-line answer and point them to the downloadable PDF at ${LINKS.resume} (and navigate to the contact section).

Otherwise keep replies under 120 words.

CONTEXT
=======
Manifesto: ${MANIFESTO}

Contact: ${LINKS.email} · GitHub ${LINKS.github} · LinkedIn ${LINKS.linkedin} · Résumé (downloadable PDF): ${LINKS.resume}

Projects:
${PROJECTS.map(
  (p) =>
    `- ${p.title} (${p.year}${p.flagship ? ', flagship' : ''}): ${p.subtitle}. ${p.description} Impact: ${p.metric} ${p.metricLabel}. Stack: ${p.stack.join(', ')}.${p.link ? ` Repo: ${p.link}` : ''}`,
).join('\n')}

Experience:
${JOBS.map(
  (j) =>
    `- ${j.company}, ${j.role} (${j.period}, ${j.location}): ${j.summary} ${j.points.join(' ')}${
      j.engagements
        ? ' Client engagements: ' +
          j.engagements.map((e) => `${e.client} (${e.role}) — ${e.detail}`).join(' | ')
        : ''
    }`,
).join('\n')}

Stack:
${STACK_GROUPS.map((g) => `- ${g.name}: ${g.items.join(', ')}`).join('\n')}
`

const TOOLS = [
  {
    name: 'navigate',
    description:
      'Scroll the portfolio page to a section so the visitor sees it. Call when discussing that content.',
    input_schema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['top', 'work', 'experience', 'stack', 'contact'],
          description:
            'top = hero, work = projects, experience = jobs & client engagements, stack = skills, contact = contact info',
        },
      },
      required: ['section'],
      additionalProperties: false,
    },
  },
]

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405)
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return json({ error: 'offline' }, 503)
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const now = Date.now()
  const bucket = hits.get(ip)
  if (bucket && now - bucket.ts < WINDOW_MS) {
    if (bucket.count >= MAX_HITS) return json({ error: 'rate_limited' }, 429)
    bucket.count++
  } else {
    hits.set(ip, { count: 1, ts: now })
  }

  let body: { messages?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return json({ error: 'bad_request' }, 400)
  }
  if (JSON.stringify(messages).length > MAX_CHARS * MAX_MESSAGES) {
    return json({ error: 'bad_request' }, 400)
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages,
      stream: true,
    }),
  })

  if (!upstream.ok || !upstream.body) {
    return json({ error: 'upstream', status: upstream.status }, 502)
  }

  return new Response(upstream.body, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
    },
  })
}

function json(obj: object, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
