// Hidden résumé-replace endpoint for the /admin page. Password-gated entirely
// server-side (the check never reaches the client bundle). Requires two env
// vars in Vercel: ADMIN_PASSWORD (you choose) and BLOB_READ_WRITE_TOKEN
// (auto-set when a Blob store is connected to the project).
import { put } from '@vercel/blob'

export const config = { runtime: 'edge' }

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const password = process.env.ADMIN_PASSWORD
  if (!password) return json({ error: 'disabled' }, 503)

  const given = req.headers.get('x-admin-password') ?? ''
  // length gate first, then a full compare — good enough for a single-user tool
  if (given.length !== password.length || given !== password) {
    return json({ error: 'unauthorized' }, 401)
  }

  let file: unknown
  try {
    const form = await req.formData()
    file = form.get('file')
  } catch {
    return json({ error: 'bad_request' }, 400)
  }

  if (!(file instanceof File)) return json({ error: 'no_file' }, 400)
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
