import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

// RFQ wizard may submit artwork (up to 20 MB/file). Raise the server-action
// payload ceiling above the 1 MB default so multi-file uploads don't get rejected.
// Cast via unknown: the published NextConfig type lags the runtime that already
// supports `serverActions.bodySizeLimit`.
const nextConfig = {
  serverActions: {
    bodySizeLimit: '50mb',
  },
} as unknown as NextConfig

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(nextConfig)
