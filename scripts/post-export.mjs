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
console.log(`post-export: wrote index.html (→ ${target}) + .nojekyll`)
