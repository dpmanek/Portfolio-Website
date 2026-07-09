// Locks the hidden admin surface behind HTTP Basic Auth. Runs at the edge
// before the page or API is served, so unauthorized visitors get a 401 and
// never see the admin page at all. Credentials come from env:
//   ADMIN_PASSWORD  (required — same secret the upload endpoint checks)
//   ADMIN_USER      (optional — defaults to "deep")
import { next } from '@vercel/edge'

export const config = {
  matcher: ['/admin', '/admin.html', '/api/admin/:path*'],
}

export default function middleware(req: Request): Response | undefined {
  const password = process.env.ADMIN_PASSWORD
  // If no password is configured, keep the admin surface closed rather than open.
  if (!password) {
    return new Response('Admin is not configured.', { status: 503 })
  }

  const user = process.env.ADMIN_USER || 'deep'
  const expected = 'Basic ' + btoa(`${user}:${password}`)
  const provided = req.headers.get('authorization') ?? ''

  if (provided !== expected) {
    return new Response('Authentication required.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="admin", charset="UTF-8"' },
    })
  }

  return next()
}
