import { useCallback, useEffect, useRef, useState } from 'react'
import {
  streamTurn,
  offlineReply,
  OfflineError,
  type ApiMessage,
  type ContentBlock,
  type Section,
} from '../lib/agent'

interface Props {
  open: boolean
  onClose: () => void
  onNavigate: (id: string) => void
}

interface ChatLine {
  role: 'user' | 'assistant' | 'system'
  text: string
}

const SUGGESTIONS = [
  'What has Deep shipped in production?',
  'Generate a deployment plan for my company',
  'What is his AI stack?',
  'How do I reach him?',
]

const MAX_TOOL_LOOPS = 3

export default function DeepOS({ open, onClose, onNavigate }: Props) {
  const [lines, setLines] = useState<ChatLine[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<'live' | 'offline' | null>(null)
  const apiMessages = useRef<ApiMessage[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const appendToLast = useCallback((text: string) => {
    setLines((prev) => {
      const next = [...prev]
      const last = next[next.length - 1]
      if (last?.role === 'assistant') {
        next[next.length - 1] = { ...last, text: last.text + text }
      }
      return next
    })
  }, [])

  const runOffline = useCallback(
    (query: string) => {
      setMode('offline')
      const reply = offlineReply(query)
      if (reply.section) onNavigate(reply.section)
      // type the scripted answer out so it still feels alive
      let i = 0
      const tick = () => {
        const chunk = reply.text.slice(i, i + 3)
        i += 3
        appendToLast(chunk)
        if (i < reply.text.length) setTimeout(tick, 12)
        else setBusy(false)
      }
      tick()
    },
    [appendToLast, onNavigate],
  )

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim()
      if (!text || busy) return
      setBusy(true)
      setInput('')
      setLines((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: '' }])

      let msgs: ApiMessage[] = [...apiMessages.current, { role: 'user', content: text }]

      try {
        for (let loop = 0; loop < MAX_TOOL_LOOPS; loop++) {
          const { content, stopReason } = await streamTurn(msgs, appendToLast)
          setMode('live')
          msgs = [...msgs, { role: 'assistant', content: content as never }]

          const toolUses = content.filter((b): b is Extract<ContentBlock, { type: 'tool_use' }> => b.type === 'tool_use')
          if (stopReason === 'tool_use' && toolUses.length > 0) {
            // execute all tool calls, return all results in ONE user message
            const results = toolUses.map((tu) => {
              if (tu.name === 'navigate' && tu.input.section) {
                onNavigate(tu.input.section as Section)
                return {
                  type: 'tool_result',
                  tool_use_id: tu.id,
                  content: `Navigated to ${tu.input.section}.`,
                }
              }
              return {
                type: 'tool_result',
                tool_use_id: tu.id,
                content: 'Unknown tool.',
                is_error: true,
              }
            })
            msgs = [...msgs, { role: 'user', content: results }]
            continue
          }
          break
        }
        apiMessages.current = msgs
        setBusy(false)
      } catch (err) {
        if (err instanceof OfflineError) {
          runOffline(text)
        } else {
          appendToLast('⚠ backend error — try again in a moment.')
          setBusy(false)
        }
      }
    },
    [busy, appendToLast, onNavigate, runOffline],
  )

  if (!open) return null

  return (
    <div className="deepos-overlay" role="dialog" aria-modal="true" aria-label="DEEP·OS console" onClick={onClose}>
      <div className="deepos" onClick={(e) => e.stopPropagation()}>
        <div className="deepos-head mono">
          <span className="deepos-title">
            <span className="dot" /> DEEP·OS — operator console
          </span>
          <span className="deepos-mode">
            {mode === 'offline' ? 'offline · scripted' : mode === 'live' ? 'live · claude' : 'ready'}
          </span>
          <button className="deepos-close" onClick={onClose} aria-label="Close console">
            esc
          </button>
        </div>

        <div className="deepos-scroll" ref={scrollRef}>
          {lines.length === 0 && (
            <div className="deepos-empty">
              <p className="mono">// ask the system anything about deep manek</p>
              <div className="deepos-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} data-cursor="talk">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {lines.map((l, i) => (
            <div key={i} className={`deepos-line ${l.role}`}>
              <span className="prompt mono">{l.role === 'user' ? '>' : '·'}</span>
              <div className="body">
                {l.text || (busy && i === lines.length - 1 ? <span className="deepos-caret" /> : null)}
              </div>
            </div>
          ))}
        </div>

        <form
          className="deepos-input"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <span className="mono prompt">▮</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="query the system…"
            aria-label="Message DEEP·OS"
            maxLength={500}
          />
          <button type="submit" className="mono" disabled={busy}>
            run ↵
          </button>
        </form>
      </div>
    </div>
  )
}
