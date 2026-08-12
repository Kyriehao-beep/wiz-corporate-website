import { expect, it } from 'vitest'

import { buildRfqUrl } from '@/features/rfq-link/build-rfq-url'

it('carries product, application, and source context into the RFQ URL', () => {
  expect(
    buildRfqUrl({
      locale: 'en',
      product: 'custom-pvc-rubber-patches',
      application: 'surf-watersports',
      source: 'application-detail',
    }),
  ).toBe(
    '/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports&source=application-detail',
  )
})
