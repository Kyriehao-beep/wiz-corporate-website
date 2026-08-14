import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// RFQ wizard may submit artwork (up to 5 files × 20 MB = 100 MB aggregate). Raise
// the server-action payload ceiling above the 1 MB default so multi-file uploads
// don't get rejected. Path is `experimental.serverActions.bodySizeLimit` (verified
// against next/dist/server/config-schema.js). Headroom over the 100 MB policy max.
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '120mb',
    },
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(nextConfig)
