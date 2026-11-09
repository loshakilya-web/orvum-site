# orvum-site — public website www.orvum.com (Astro, static)

Owner decision 9 Nov 2026: the public site moves from the shared `orvum-core-demo` project to this static Astro site
in its own repository and Vercel project. Demo (demo.orvum.com) and the investor site stay separate.

## Commands
- `npm run build` — Astro build + `dist/sitemap.xml` (lastmod = git date of each page's sources, Brief #1 R7)
- `npm run check` — static acceptance checks (titles, canonicals, one H1, one JSON-LD graph, approved copy, links, assets, no access-code gate)

## What is where
- `src/pages/` — `/`, `/platform`, `/about`, `/contact`, `/privacy`, `/terms`, `404`
- `public/hero.html` — the sphere hero (iframe on `/`), noindex/indexifembedded. "Enter demo" goes to https://demo.orvum.com/ (code is entered there).
- `public/js/va-init.js` — Vercel Web Analytics bootstrap without inline script (CSP `script-src 'self'`); events: email_click, linkedin_click, demo_enter_click, calculator_used
- `vercel.json` — R1 redirects, `/app|/x|/api` → demo.orvum.com, security headers (same CSP as the old site), noindex on any host other than www.orvum.com
- `src/site.mjs` — contacts and `PRIVACY_NOTICE_DATE` (set to the real switch date in the release commit)

## Before the domain switch (owner "yes" required)
1. Vercel → this project → Analytics → Enable (Web Analytics is per project).
2. Preview acceptance per Site Brief #1 R9 (routes, meta, redirects, CSP console, visual compare, PageSpeed mobile LCP ≤ 2.5 s, CLS ≤ 0.1).
3. Set `PRIVACY_NOTICE_DATE` to the switch date.
4. Move www.orvum.com (and orvum.com / orvum.ai / www.orvum.ai redirects) to this project; keep the old project 14 days for rollback. Do not touch demo.orvum.com.
