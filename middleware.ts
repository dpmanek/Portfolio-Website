// Edge middleware. Two jobs:
//
// 1. Locks the hidden admin surface behind HTTP Basic Auth. Runs before the
//    page or API is served, so unauthorized visitors get a 401 and never see
//    the admin page at all. Credentials come from env:
//      ADMIN_PASSWORD  (required — same secret the upload endpoint checks)
//      ADMIN_USER      (optional — defaults to "deep")
//
// 2. Maintenance mode. When the env var MAINTENANCE_MODE is set to a truthy
//    value, every public route serves a "be right back" page with HTTP 503 so
//    search engines treat it as temporary and don't drop rankings. The admin
//    surface stays reachable so the site can still be managed while down.
//    Toggle it entirely from the Vercel dashboard — no code change needed:
//      enable:  add env var MAINTENANCE_MODE = 1, then Redeploy
//      disable: remove MAINTENANCE_MODE, then Redeploy
import { next } from '@vercel/edge'

export const config = {
  // Run on all page routes (paths without a file extension) plus the admin
  // surface. Static assets (/assets/*, *.js, *.css, favicon.svg, og.png) are
  // excluded so they aren't touched when maintenance mode is off.
  matcher: [
    '/((?!assets/|_vercel|.*\\.[\\w]+$).*)',
    '/admin',
    '/admin.html',
    '/api/admin/:path*',
  ],
}

export default function middleware(req: Request): Response | undefined {
  const path = new URL(req.url).pathname
  const isAdmin =
    path === '/admin' ||
    path === '/admin.html' ||
    path.startsWith('/api/admin')

  // --- Admin auth (runs regardless of maintenance mode) ---
  if (isAdmin) {
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

  // --- Maintenance mode (public routes only) ---
  if (process.env.MAINTENANCE_MODE) {
    return new Response(MAINTENANCE_PAGE, {
      status: 503,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'retry-after': '86400',
        'cache-control': 'no-store',
      },
    })
  }

  return next()
}

const MAINTENANCE_PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#0a0a0b" />
<title>Deep Manek — Back soon</title>
<style>
  :root {
    --bg: #0a0a0b;
    --bg-soft: #101012;
    --ink: #ececea;
    --ink-dim: #8a8a88;
    --ink-faint: #3a3a3c;
    --accent: #d9ff3f;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: var(--bg);
    color: var(--ink);
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100dvh;
    padding: 2rem;
    -webkit-font-smoothing: antialiased;
  }
  .wrap {
    max-width: 34rem;
    width: 100%;
  }
  .tag {
    font-family: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    margin-bottom: 1.75rem;
  }
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 0 rgba(217, 255, 63, 0.7);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%   { box-shadow: 0 0 0 0 rgba(217, 255, 63, 0.55); }
    70%  { box-shadow: 0 0 0 10px rgba(217, 255, 63, 0); }
    100% { box-shadow: 0 0 0 0 rgba(217, 255, 63, 0); }
  }
  h1 {
    font-size: clamp(2rem, 6vw, 3.25rem);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.02em;
    margin-bottom: 1.1rem;
  }
  h1 .accent { color: var(--accent); }
  p {
    color: var(--ink-dim);
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 30rem;
  }
  .rule {
    height: 1px;
    background: var(--ink-faint);
    margin: 2.25rem 0 1.5rem;
    opacity: 0.6;
  }
  .foot {
    font-family: ui-monospace, 'JetBrains Mono', 'SF Mono', Menlo, monospace;
    font-size: 0.8rem;
    color: var(--ink-faint);
  }
  .foot a { color: var(--ink-dim); text-decoration: none; border-bottom: 1px solid var(--ink-faint); }
  .foot a:hover { color: var(--accent); border-color: var(--accent); }
</style>
</head>
<body>
  <main class="wrap">
    <span class="tag"><span class="dot"></span>Under maintenance</span>
    <h1>Tuning a few things.<br /><span class="accent">Back shortly.</span></h1>
    <p>This site is briefly offline for updates. Nothing to do on your end — check back soon.</p>
    <div class="rule"></div>
    <p class="foot">Deep Manek — Forward Deployed AI Engineer · <a href="https://www.linkedin.com/in/deepmanek">LinkedIn</a></p>
  </main>
</body>
</html>`
