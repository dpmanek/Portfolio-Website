// Client side of DEEP·OS: SSE parsing for the /api/chat stream plus the
// scripted offline responder used when no backend/API key is available.
import { PROJECTS, JOBS, STACK_GROUPS, LINKS } from '../data'

export type Section = 'top' | 'work' | 'experience' | 'stack' | 'contact'

interface TextBlock {
  type: 'text'
  text: string
}

interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: { section?: Section }
}

export type ContentBlock = TextBlock | ToolUseBlock

export interface ApiMessage {
  role: 'user' | 'assistant'
  content: string | Array<Record<string, unknown>>
}

export class OfflineError extends Error {}

interface TurnResult {
  content: ContentBlock[]
  stopReason: string | null
}

// Streams one assistant turn from /api/chat, invoking onText per delta.
export async function streamTurn(
  messages: ApiMessage[],
  onText: (text: string) => void,
): Promise<TurnResult> {
  let res: Response
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
  } catch {
    throw new OfflineError()
  }
  if (res.status === 503 || res.status === 404 || res.status === 405) throw new OfflineError()
  if (!res.ok || !res.body) throw new Error(`chat backend error ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  const blocks: Array<TextBlock | (ToolUseBlock & { partialJson?: string })> = []
  let stopReason: string | null = null

  const handleEvent = (data: string) => {
    let ev: Record<string, unknown>
    try {
      ev = JSON.parse(data)
    } catch {
      return
    }
    switch (ev.type) {
      case 'content_block_start': {
        const block = ev.content_block as Record<string, unknown>
        const index = ev.index as number
        if (block.type === 'text') {
          blocks[index] = { type: 'text', text: '' }
        } else if (block.type === 'tool_use') {
          blocks[index] = {
            type: 'tool_use',
            id: block.id as string,
            name: block.name as string,
            input: {},
            partialJson: '',
          }
        }
        break
      }
      case 'content_block_delta': {
        const delta = ev.delta as Record<string, unknown>
        const block = blocks[ev.index as number]
        if (!block) break
        if (delta.type === 'text_delta' && block.type === 'text') {
          block.text += delta.text as string
          onText(delta.text as string)
        } else if (delta.type === 'input_json_delta' && block.type === 'tool_use') {
          block.partialJson = (block.partialJson ?? '') + (delta.partial_json as string)
        }
        break
      }
      case 'content_block_stop': {
        const block = blocks[ev.index as number]
        if (block && block.type === 'tool_use' && block.partialJson) {
          try {
            block.input = JSON.parse(block.partialJson)
          } catch {
            block.input = {}
          }
          delete block.partialJson
        }
        break
      }
      case 'message_delta': {
        const delta = ev.delta as Record<string, unknown>
        if (delta?.stop_reason) stopReason = delta.stop_reason as string
        break
      }
    }
  }

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (line.startsWith('data: ')) handleEvent(line.slice(6))
    }
  }

  return { content: blocks as ContentBlock[], stopReason }
}

// ---------------------------------------------------------------------------
// Offline fallback: keyword-matched scripted answers over the same data the
// live agent uses. Honest about being scripted; still drives the page.

export interface OfflineReply {
  text: string
  section?: Section
}

const norm = (s: string) => s.toLowerCase()

export function offlineReply(query: string): OfflineReply {
  const q = norm(query)

  // direct project match
  for (const p of PROJECTS) {
    const words = [norm(p.title), ...p.stack.map(norm)]
    if (words.some((w) => w.length > 3 && q.includes(w))) {
      return {
        text: `${p.title} — ${p.subtitle}.\n\n${p.description}\n\nImpact: ${p.metric} (${p.metricLabel}).`,
        section: 'work',
      }
    }
  }

  if (/\b(shipped|built|projects?|production|portfolio|work)\b/.test(q)) {
    return {
      text: `Six systems in production or open R&D:\n\n${PROJECTS.map(
        (p) => `${p.index} ${p.title} — ${p.metric} ${p.metricLabel}`,
      ).join('\n')}\n\nFlagship: ${PROJECTS[0].title}. Ask about any of them by name.`,
      section: 'work',
    }
  }

  if (/\b(experience|history|career|mphasis|vanguard|aptia|cardworks|flagstar|jobs?)\b/.test(q)) {
    const j = JOBS[0]
    return {
      text: `Current deployment: ${j.company} — ${j.role} (${j.period}). ${j.summary}\n\nPrior: ${JOBS.slice(1)
        .map((x) => `${x.company} (${x.period})`)
        .join(' · ')}.`,
      section: 'experience',
    }
  }

  if (/(stack|skill|tech|tool|arsenal|language|framework)/.test(q)) {
    return {
      text: `Arsenal spans ${STACK_GROUPS.map((g) => g.name).join(', ')}. Core: ${STACK_GROUPS[0].items
        .slice(0, 5)
        .join(', ')}.`,
      section: 'stack',
    }
  }

  if (/(contact|email|hire|reach|linkedin|github|resume)/.test(q)) {
    return {
      text: `Direct line: ${LINKS.email}\nGitHub: ${LINKS.github}\nLinkedIn: ${LINKS.linkedin}\n\nOpen to FDE, AI Architect, and Solutions roles.`,
      section: 'contact',
    }
  }

  if (/\b(rag|llm|ai|bedrock|claude|agents?)\b/.test(q)) {
    const p = PROJECTS[0]
    return {
      text: `Applied AI in production is the core of this system. Flagship: ${p.title} — ${p.subtitle}. ${p.metric} ${p.metricLabel}. Also: voice agents on Kore.ai, MLflow observability, fully-offline assistants on Apple Silicon.`,
      section: 'work',
    }
  }

  if (/\b(who|about|deep|manek|intro)\b/.test(q)) {
    return {
      text: 'Deep Manek. Forward Deployed AI Engineer, NYC. 6+ years shipping production software inside banks and Fortune-500 enterprises — applied LLM systems, agentic workflows, and the cloud infrastructure underneath.',
      section: 'top',
    }
  }

  return {
    text: 'Scoped queries this console handles: projects, experience, stack, contact — or name your company for a deployment plan. (Offline mode: scripted responder. The live LLM agent activates when the backend is deployed.)',
  }
}
