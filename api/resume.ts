// Resolves the current résumé. If a copy has been uploaded to Vercel Blob via
// the hidden /admin page, redirect to the newest one; otherwise fall back to
// the static /resume.pdf shipped in public/. This lets the résumé be swapped
// without a redeploy, while still working before Blob is configured.
import { list } from '@vercel/blob'

export const config = { runtime: 'nodejs' }

// Relative Location works regardless of runtime; browsers resolve it against
// the request URL. Avoids parsing req.url, which isn't an absolute base here.
function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } })
}

export default async function handler(): Promise<Response> {
  try {
    const { blobs } = await list({ prefix: 'resume/' })
    if (blobs.length) {
      const latest = blobs.sort(
        (a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt),
      )[0]
      return redirect(latest.url)
    }
  } catch {
    // Blob not configured (no token) — fall through to the static file
  }
  return redirect('/resume.pdf')
}
