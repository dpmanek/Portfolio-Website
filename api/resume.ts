// Resolves the current résumé. If a copy has been uploaded to Vercel Blob via
// the hidden /admin page, redirect to the newest one; otherwise fall back to
// the static /resume.pdf shipped in public/. This lets the résumé be swapped
// without a redeploy, while still working before Blob is configured.
import { list } from '@vercel/blob'

export const config = { runtime: 'nodejs' }

export default async function handler(req: Request): Promise<Response> {
  try {
    const { blobs } = await list({ prefix: 'resume/' })
    if (blobs.length) {
      const latest = blobs.sort(
        (a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt),
      )[0]
      return Response.redirect(latest.url, 302)
    }
  } catch {
    // Blob not configured (no token) — fall through to the static file
  }
  return Response.redirect(new URL('/resume.pdf', req.url).toString(), 302)
}
