// Hidden résumé-replace endpoint for the /admin page. Access is gated by the
// Basic Auth edge middleware (see middleware.ts) — this route is only reachable
// after a valid ADMIN_USER/ADMIN_PASSWORD, so it does no password check itself.
// Requires BLOB_READ_WRITE_TOKEN (auto-set when a Blob store is connected).
import { put } from '@vercel/blob'

export const config = { runtime: 'nodejs' }

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let file: Blob | null = null
  try {
    const form = await req.formData()
    const entry = form.get('file')
    if (entry && typeof entry !== 'string') file = entry as Blob
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  if (!file) return json({ error: 'no_file' }, 400)
  if (file.type !== 'application/pdf') return json({ error: 'pdf_only' }, 400)
  if (file.size > MAX_BYTES) return json({ error: 'too_large' }, 400)

  const blob = await put('resume/resume.pdf', file, {
    access: 'public',
    contentType: 'application/pdf',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  return json({ ok: true, url: blob.url }, 200)
}

function json(obj: object, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
