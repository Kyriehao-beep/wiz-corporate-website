import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.wizrubberpatch.com'),
  title: 'WIZ',
  description: 'Precision in Every Color. Built for the Outdoors.',
}

export const viewport: Viewport = { themeColor: '#f3f1ec' }

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
