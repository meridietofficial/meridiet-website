/**
 * Build-time pre-render script.
 *
 * Run order (defined in package.json "build"):
 *   1. tsc             – type-check
 *   2. vite build      – client bundle  → dist/
 *   3. vite build --ssr – SSR bundle   → dist-ssr/
 *   4. node scripts/prerender.mjs  ← this script
 *
 * For every route in ROUTES this script:
 *   a) Calls the SSR render() function from dist-ssr/entry-server.js
 *   b) Injects the HTML string + Helmet head tags into the client template
 *   c) Writes dist/<route>/index.html
 *
 * Vercel serves static files with higher priority than the catch-all rewrite,
 * so Googlebot receives full HTML for every pre-rendered route. All other
 * routes (dashboard, diet-plan form, dynamic /dietitian/:id, etc.) still
 * receive the normal SPA shell and hydrate client-side.
 */

import fs   from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const ROOT       = path.resolve(__dirname, '..')
const DIST       = path.resolve(ROOT, 'dist')
const DIST_SSR   = path.resolve(ROOT, 'dist-ssr')
const TEMPLATE   = path.join(DIST, 'index.html')
const SSR_ENTRY  = path.join(DIST_SSR, 'entry-server.js')

/** All public SEO routes to pre-render. */
const ROUTES = [
  '/',
  '/about',
  '/press',
  '/blog',
  '/blog/personalized-diet-plan',
  '/blog/is-dal-good-for-weight-loss',
  '/blog/how-to-lose-belly-fat',
  '/blog/why-am-i-not-losing-weight',
  '/blog/what-is-a-calorie-deficit',
  '/blog/how-many-calories-per-day',
  '/blog/what-is-bmi',
  '/blog/pcos-diet-plan-for-indian-women',
  '/blog/high-protein-indian-foods',
  '/blog/is-rice-bad-for-weight-loss',
  '/blog/how-to-lose-weight-without-giving-up-roti-and-rice',
  '/blog/best-indian-foods-for-weight-loss',
  '/blog/how-much-protein-do-you-need',
  '/blog/diabetes-diet-plan-for-indians',
  '/blog/diet-for-thyroid-patients-india',
  '/blog/high-blood-pressure-diet-plan-india',
  '/blog/what-is-bmr',
  '/blog/what-is-tdee',
  '/blog/healthy-indian-breakfast-for-weight-loss',
  '/blog/best-evening-snacks-for-weight-loss-india',
  '/blog/how-to-plan-meals-for-the-week',
  '/blog/common-diet-myths-india',
  '/blog/does-eating-late-at-night-cause-weight-gain',
  '/blog/is-ghee-bad-for-weight-loss',
  '/blog/why-crash-diets-dont-work',
  '/blog/how-much-water-should-you-drink',
  '/blog/how-poor-sleep-affects-weight',
  '/sponsor-cohort',
  '/faq',
  '/calculators',
  '/contact',
  '/for-dietitians',
  '/women-empowerment',
  '/nutritionist-course',
  '/careers',
  '/consult-dietitian',
  '/weight-loss',
  '/pcos',
  '/diabetes',
  '/thyroid',
  '/privacy-policy',
  '/terms-conditions',
  '/refund-policy',
  '/404',
]

// ─── Guards ──────────────────────────────────────────────────────────────────

if (!fs.existsSync(TEMPLATE)) {
  console.error('[prerender] Client bundle not found. Run `vite build` first.')
  process.exit(1)
}

if (!fs.existsSync(SSR_ENTRY)) {
  console.error('[prerender] SSR bundle not found. Run `vite build --ssr` first.')
  process.exit(1)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Read the clean SPA shell BEFORE any writes.
  // The '/' route writes its pre-rendered HTML back to dist/index.html, which
  // would corrupt the template for subsequent runs. We persist the original shell
  // alongside the SSR bundle so re-running `npm run prerender` standalone is safe.
  const SHELL = path.join(DIST_SSR, 'shell.html')
  let template = fs.readFileSync(TEMPLATE, 'utf-8')

  if (!template.includes('<!--app-html-->')) {
    // dist/index.html has already been pre-rendered (previous run overwrote it).
    // Restore the clean shell from the backup we wrote during the first run.
    if (!fs.existsSync(SHELL)) {
      console.error('[prerender] Shell backup not found and dist/index.html has no placeholder.')
      console.error('            Run `npm run build:client` first to regenerate the SPA shell.')
      process.exit(1)
    }
    template = fs.readFileSync(SHELL, 'utf-8')
    console.log('[prerender] Restored SPA shell from dist-ssr/shell.html')
  } else {
    // First run — save the clean shell so subsequent standalone runs work.
    fs.writeFileSync(SHELL, template, 'utf-8')
  }

  // Dynamic import works for both ESM and CJS bundles.
  // pathToFileURL handles Windows drive-letter paths correctly.
  const { render } = await import(pathToFileURL(SSR_ENTRY).href)

  let ok = 0

  for (const route of ROUTES) {
    try {
      const { appHtml, helmetContext } = render(route)

      // react-helmet-async exposes rendered tags through the context object
      const helmet = helmetContext?.helmet

      // Collect head tags produced by the SEO component for this route
      const headTags = helmet
        ? [
            helmet.title?.toString()  ?? '',
            helmet.meta?.toString()   ?? '',
            helmet.link?.toString()   ?? '',
            helmet.script?.toString() ?? '',
          ]
            .map(s => s.trim())
            .filter(Boolean)
            .join('\n    ')
        : ''

      // Strip the static fallback tags from index.html that Helmet now controls.
      // We only remove tags that Helmet will inject — keeping robots, author, fonts, scripts.
      let html = template
        .replace('<!--app-html-->', appHtml)
        .replace('<!--app-head-->',  headTags)
        // Remove static <title> (Helmet provides the page-specific one)
        .replace(/\n?\s*<title>[^<]*<\/title>/g, '')
        // Remove static <meta name="description" ...>
        .replace(/\n?\s*<meta name="description"[^>]*>/g, '')
        // Remove static <meta name="keywords" ...>
        .replace(/\n?\s*<meta name="keywords"[^>]*>/g, '')
        // Remove static canonical (Helmet provides the per-route one)
        .replace(/\n?\s*<link rel="canonical"[^>]*>/g, '')
        // Remove static Open Graph tags
        .replace(/\n?\s*<meta property="og:[^>]*>/g, '')
        // Remove static Twitter Card tags
        .replace(/\n?\s*<meta name="twitter:[^>]*>/g, '')

      // Write dist/<route>/index.html  (or dist/index.html for "/")
      // Special case: /404 writes to dist/404.html for nginx error_page
      if (route === '/404') {
        fs.writeFileSync(path.join(DIST, '404.html'), html, 'utf-8')
      } else {
        const slug   = route === '/' ? '' : route.slice(1)   // e.g. "about"
        const outDir = path.join(DIST, slug)
        fs.mkdirSync(outDir, { recursive: true })
        fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8')
      }

      console.log(`[prerender] ✓  ${route}`)
      ok++
    } catch (err) {
      // A single failing route must not abort the rest — log and continue.
      console.error(`[prerender] ✗  ${route}`)
      console.error('            ', err?.message ?? err)
    }
  }

  console.log(`\n[prerender] ${ok} / ${ROUTES.length} routes pre-rendered.\n`)

  if (ok === 0) {
    console.error('[prerender] No routes pre-rendered — check errors above.')
    process.exit(1)
  }

  // ── Generate sitemap.xml ──────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)

  const priority = (route) => {
    if (route === '/')                         return '1.0'
    if (['/consult-dietitian', '/blog', '/weight-loss', '/pcos', '/diabetes', '/thyroid'].includes(route)) return '0.9'
    if (['/calculators', '/for-dietitians', '/nutritionist-course', '/faq'].includes(route)) return '0.8'
    if (route.startsWith('/blog/'))            return '0.7'
    if (['/about', '/contact', '/press', '/women-empowerment', '/careers', '/sponsor-cohort'].includes(route)) return '0.7'
    return '0.4'
  }

  const changefreq = (route) => {
    if (route === '/' || route === '/blog' || route.startsWith('/blog/')) return 'weekly'
    if (['/consult-dietitian', '/calculators', '/weight-loss', '/pcos', '/diabetes', '/thyroid'].includes(route)) return 'weekly'
    return 'monthly'
  }

  const sitemapRoutes = ROUTES.filter(r => r !== '/404')
  const urlset = sitemapRoutes.map(route => `
  <url>
    <loc>https://meridiet.com${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq(route)}</changefreq>
    <priority>${priority(route)}</priority>
  </url>`).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlset}
</urlset>`

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap, 'utf-8')
  console.log(`[prerender] sitemap.xml written (${sitemapRoutes.length} URLs)\n`)
}

main().catch(err => {
  console.error('[prerender] Fatal error:', err)
  process.exit(1)
})
