import { defaultLocale } from '@/i18n/locales'

// Static export cannot use server-side `redirect()`; the built `out/index.html`
// is overwritten by scripts/post-export.mjs to redirect to the default locale.
export const dynamic = 'force-static'

export default function RootPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <p>Loading…</p>
    </main>
  )
}
