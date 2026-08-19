import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('out')

// Keep in sync with `defaultLocale` in src/i18n/locales.ts (currently 'en').
const defaultLocale = 'en'
const target = `./${defaultLocale}/`

const html = `<!doctype html>
<html lang="${defaultLocale}">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${target}" />
    <title>WIZ</title>
  </head>
  <body>
    <script>window.location.replace('${target}')</script>
    <p>Redirecting to <a href="${target}">WIZ — ${defaultLocale}</a>…</p>
  </body>
</html>
`

fs.writeFileSync(path.join(OUT, 'index.html'), html)
// GitHub Pages runs Jekyll by default, which strips files/dirs starting with
// an underscore (e.g. `_next`). This opts the deployment out of Jekyll.
fs.writeFileSync(path.join(OUT, '.nojekyll'), '')

// next/image's `unoptimized` mode does NOT automatically prefix public-folder
// assets (e.g. `/media/...`) with `basePath`. GitHub Pages serves the site at
// `/wiz-corporate-website/`, so bare `/media/...` URLs 404. Rewrite every
// `/media/` reference in the exported HTML/JS/CSS to include the base path.
const basePath = process.env.BASE_PATH || '/wiz-corporate-website'
const mediaPrefix = `${basePath}/media/`
const REWRITE_EXT = new Set(['.html', '.js', '.css', '.json', '.xml', '.txt'])

let rewritten = 0
if (fs.existsSync(OUT)) {
  const snapshot = []
  function count(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) count(full)
      else if (REWRITE_EXT.has(path.extname(entry.name))) {
        const before = fs.readFileSync(full, 'utf8')
        if (before.includes('/media/')) {
          snapshot.push(full)
          fs.writeFileSync(full, before.replaceAll('/media/', mediaPrefix))
        }
      }
    }
  }
  count(OUT)
  rewritten = snapshot.length
}
console.log(`post-export: wrote index.html (→ ${target}) + .nojekyll; rewrote ${rewritten} file(s) with ${mediaPrefix}`)
